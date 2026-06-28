// engine.js — THE "BRAIN" OF THE SPREADSHEET just the maths/logic.

// app.js 'the screen' is only allowed to call these five things:
//   Engine.setRaw(ref, text)   remember what the user typed into a cell.
//   Engine.getRaw(ref)         give back the exact text they typed for the formula bar.
//   Engine.getDisplay(ref)     give back what to SHOW in the grid a number, text, or an error.
//   Engine.colName(i)          turn a column number into a letter: 0 -> "A", 9 -> "J"
//   Engine.colIndex(s)         turn a column letter into a number: "A" -> 0, "J" -> 9

// Lets explain the whole idea inn plain English to Zinhle:

//   A cell holds one of three things: a number, some words, or a formula that
//   starts with "=" (like "=A1+B2").
//   To find a formula's answer we do three steps:
//     1. "Tokenize" the text  = chop it into little pieces: numbers, cell
//        names, and the symbols + - * / ( ).  (Think: splitting a sentence
//        into separate words.)
//     2. "Parse" the pieces   = read them in the correct order so that * and /
//        happen before + and -, and brackets ( ) go first. While reading, we
//        also do the actual sum.
//     3. Whenever the formula mentions another cell (like A1), we go and work
//        out THAT cell's value first. That cell might be a formula too, so we
//        repeat the same steps for it. Because we always finish the cells we
//        depend on first, everything ends up calculated in the right order
//        without us planning the order ourselves.
//   Two extra tricks:
//     1. We "remember" (cache) each answer we work out, so we never calculate
//       the same cell twice during one refresh.
//     2. We keep a list of "cells we are busy calculating right now". If a cell
//       ever needs itself (directly or through a chain), it will already be on
//       that list — that is how we spot a circular reference instead of getting
//       stuck in an endless loop.

// This wraps the whole engine in a function that runs itself straight away
// you write it once and call it with the "()" at the very bottom). Everything
// inside is private and hidden from the rest of the page, EXCEPT the few names
// we hand back in the "return { ... }" at the end. This keeps our helper
// functions from clashing with anything in app.js.
const Engine = (function () {

  // A little "error label" we use when a formula goes wrong. When something
  // breaks (like dividing by zero) we "throw" one of these — think of throw as
  // an emergency eject that jumps straight out to wherever we said "try ...
  // catch". The catch then shows the right error text (like #DIV/0!) in the cell.
  // The "code" it carries is one of the error strings from CONFIG.
  class FormulaError {
    constructor(code) { this.code = code; }
  }

  // ----- the three things the engine remembers -----
  const raw = {};            // for each cell: the exact text the user typed, e.g. raw["B3"] = "=A1+5"
  let cache = {};            // for each cell: its worked-out answer, so we don't redo the same sum
  let computing = new Set(); // the cells we are in the MIDDLE of calculating right now (used to catch loops)


  // Turning column NUMBERS into LETTERS and back.
  // The grid uses numbers (column 0, 1, 2 ...) but people read letters
  // (A, B, C ...). colName turns a number into letters; colIndex does the
  // reverse. They even keep working past Z (it goes AA, AB, ...), so if the
  // grid is made wider for testing, nothing breaks.


  // Guys this function is very important. 
  function colName(index) {
    let name = '';
    index += 1;                       // start counting from 1 instead of 0; it makes the maths below simpler
    while (index > 0) {
      const remainder = (index - 1) % 26;
      name = String.fromCharCode(65 + remainder) + name;
      index = Math.floor((index - 1) / 26);
    }
    return name;
  }

  function colIndex(letters) {
    let n = 0;
    for (const ch of letters.toUpperCase()) {
      n = n * 26 + (ch.charCodeAt(0) - 64);
    }
    return n - 1;                      // back to 0-based ("A" -> 0)
  }

  // A few small helpers for working with values

  // Does this text look like a real number?
  // Watch out: JavaScript thinks Number('') is 0, so an empty box would look
  // like a number by mistake — that's why we check it isn't blank FIRST.
  // Number('Hello') gives NaN ("Not a Number"), so the second check throws
  // out words. Only text that passes both is a real number.
  function isNumber(text) {
    return text.trim() !== '' && !Number.isNaN(Number(text));
  }

  function formatNumber(n) {
    return String(Number(n.toFixed(10)));
  }

  // Split a cell name into its column and row, e.g. "B3" -> { col: 1, row: 3 }.
  // The /.../ thing is a "regular expression" (a search pattern): it checks the
  // text is some letters followed by some digits. If it isn't, the name is
  // nonsense, so we raise a syntax error.
  function parseRef(refString) {
    const match = /^([A-Z]+)(\d+)$/.exec(refString);
    if (!match) throw new FormulaError(CONFIG.ERRORS.SYNTAX);
    return { col: colIndex(match[1]), row: Number(match[2]) };
  }

  // Is this cell actually ON the grid? For a 10-column (A–J) grid, "K1" is off
  // the edge, so we treat it as a mistake.
  function refInGrid(col, row) {
    return col >= 0 && col < CONFIG.COLUMNS && row >= 1 && row <= CONFIG.ROWS;
  }


  // 'Saving and reading the text the user typed'

  // Called when the user finishes typing in a cell. We just store the text.
  // If they cleared the cell, we delete it so the cell counts as empty.
  function setRaw(ref, value) {
    if (value === '' || value == null) delete raw[ref];
    else raw[ref] = value;
    // One change might affect lots of other formulas, so the simplest safe
    // thing is to forget ALL the remembered answers. They get worked out
    // again the next time the grid is shown. 
    cache = {};
  }

  // Give back the exact text the user typed (used to fill the formula bar).
  // The "?? ''" means: if this cell has nothing stored, return an empty string.
  function getRaw(ref) {
    return raw[ref] ?? '';
  }

  // Work out what the grid should actually SHOW in this cell.
  function getDisplay(ref) {
    const result = resolve(ref);                          // go work out the value
    if (result === null) return '';                       // nothing in the cell - show blank
    if (typeof result === 'object') return result.err;    // it's an error - show the error text
    if (typeof result === 'number') {
      // Infinity can sneak in from huge sums; we don't want to show "Infinity".
      if (!Number.isFinite(result)) return CONFIG.ERRORS.SYNTAX;
      return formatNumber(result);                        // a number - show it tidied up
    }
    return result;                                        // otherwise it's plain text - show as-is
  }


  // resolve(): the heart of the engine. It works out ONE cell's value, while
  // (a) remembering the answer and (b) watching for circular references.
  // It hands back one of four things:
  //   null            the cell is empty
  //   a number        the cell is a number, or a formula that added up to a number
  //   a piece of text the cell holds words
  //   { err: code }   something went wrong (this object carries the error text)

  function resolve(ref) {
    if (ref in cache) return cache[ref];                  // already worked it out and reuse the saved answer

    // If this cell is ALREADY on our "busy calculating" list, then to finish
    if (computing.has(ref)) {
      return { err: CONFIG.ERRORS.CIRCULAR };
    }

    computing.add(ref);                                   // mark "I'm busy calculating this one"
    let result;
    try {
      result = computeRaw(ref);                           // try to work it out
    } catch (e) {
      // If anything was thrown while calculating (like a div-by-zero), turn it
      // into an error result instead of letting the whole program crash.
      result = { err: e instanceof FormulaError ? e.code : CONFIG.ERRORS.SYNTAX };
    }
    computing.delete(ref);                                // finished - take it off the busy list

    cache[ref] = result;                                  // remember the answer for next time
    return result;
  }

  // Look at the raw text and decide what kind of thing the cell is, then
  // produce its value. (If it's a broken formula this may throw an error,
  // which resolve() above will catch.)
  function computeRaw(ref) {
    const text = raw[ref];
    if (text === undefined || text === '') return null;          // empty cell
    if (text[0] === '=') return evalFormula(text.slice(1));      // starts with "=" - it's a formula (slice off the "=")
    if (isNumber(text)) return Number(text);                     // looks like a number - use it as a number
    return text;                                                 // anything else -> it's just text
  }

  // When a formula mentions a cell (like the A1 in "=A1+5"), the maths needs
  // that cell as a NUMBER. Here we decide what number to use:
  //   empty cell  -> 0        (our chosen rule: a blank cell counts as zero.
  //   number      -> that number
  //   text        -> #VALUE!  (you can't do maths on words — "the arithmetic on text" rule)
  //   error       -> pass the same error onwards, so one bad cell makes the
  //                  cells that depend on it show an error too.

  function refAsNumber(ref) {
    const result = resolve(ref);
    if (result === null) return 0;
    if (typeof result === 'number') return result;
    if (typeof result === 'object') throw new FormulaError(result.err);
    throw new FormulaError(CONFIG.ERRORS.VALUE);   // anything left is text
  }


  // Working out a formula happens in two steps:
  //   1.chop the text into pieces
  //   2.read those pieces in the right order AND do the maths

  function evalFormula(source) {
    const tokens = tokenize(source);             // step 1: chop into pieces
    const parser = makeParser(tokens);
    const value = parser.parseExpression();      // step 2: read them and add up the answer
    parser.expectEnd();          // if anything is left over (like "=1 2") the formula is broken
    return value;
  }

  // ----- STEP 1, THE TOKENIZER: turn the text into a list of "pieces" -----
  // Example: "A1+10*2" becomes the list:
  //   [cell A1] [+] [number 10] [*] [number 2]
  // Each piece is a small object with a "type" (and sometimes a value). This is
  // just like splitting a sentence into separate words before reading it.
  function tokenize(source) {
    const tokens = [];      // the list of pieces we will build up
    let i = 0;              // where we are while reading through the text, letter by letter
    const isDigit  = c => c >= '0' && c <= '9';                              // is this char 0-9?
    const isLetter = c => (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z');  // is this char a-z or A-Z?

    while (i < source.length) {   // keep going until we've read the whole text
      const c = source[i];        // the current character

      if (c === ' ' || c === '\t') { i++; continue; }   // skip spaces and tabs

      // If it's a digit (or a dot), read the whole number, e.g. "10" or "3.14"
      if (isDigit(c) || c === '.') {
        let text = '';
        while (i < source.length && (isDigit(source[i]) || source[i] === '.')) {
          text += source[i++];
        }
        const value = Number(text);
        if (Number.isNaN(value)) throw new FormulaError(CONFIG.ERRORS.SYNTAX);
        tokens.push({ type: 'number', value });
        continue;
      }

      // If it's a letter, read all the letters, then any digits right after.
      // Letters + digits (like "A1") means it's a CELL NAME.
      // Letters with no digits (like "SUM") means it's a FUNCTION NAME.
      if (isLetter(c)) {
        let letters = '';
        while (i < source.length && isLetter(source[i])) letters += source[i++];
        let digits = '';
        while (i < source.length && isDigit(source[i])) digits += source[i++];
        if (digits !== '') {
          tokens.push({ type: 'ref', value: letters.toUpperCase() + digits });  // e.g. a1 -> A1
        } else {
          tokens.push({ type: 'name', value: letters.toUpperCase() });          // e.g. sum -> SUM
        }
        continue;
      }

      // If it's one of these symbols, store it as its own piece.
      if ('+-*/():'.includes(c)) { tokens.push({ type: c }); i++; continue; }

      throw new FormulaError(CONFIG.ERRORS.SYNTAX);      // any other character is not allowed
    }
    return tokens;
  }

  function makeParser(tokens) {
    let pos = 0;                          // which piece we're looking at
    const peek = () => tokens[pos];       // look at it
    const next = () => tokens[pos++];     // take it and step forward
    const SYNTAX = CONFIG.ERRORS.SYNTAX;

    // The "+ and -" layer. First get a term, then while the next piece is a
    // + or -, grab another term and add or subtract it.
    function parseExpression() {
      let value = parseTerm();
      while (peek() && (peek().type === '+' || peek().type === '-')) {
        const op = next().type;           // the + or - itself
        const right = parseTerm();        // the value on the right of it
        value = op === '+' ? value + right : value - right;
      }
      return value;
    }

    // The "* and /" layer. Same shape as above, but for multiply and divide.
    // Because this finishes before the +/- layer, it "binds tighter".
    function parseTerm() {
      let value = parseFactor();
      while (peek() && (peek().type === '*' || peek().type === '/')) {
        const op = next().type;
        const right = parseFactor();
        if (op === '*') {
          value = value * right;
        } else {
          if (right === 0) throw new FormulaError(CONFIG.ERRORS.DIV_ZERO);  // can't divide by zero
          value = value / right;
        }
      }
      return value;
    }

    // Handles a + or - sign written in FRONT of a value, like -A1 or +5.
    function parseFactor() {
      const t = peek();
      if (!t) throw new FormulaError(SYNTAX);
      if (t.type === '+') { next(); return parseFactor(); }   // a leading + does nothing:  +x  is  x
      if (t.type === '-') { next(); return -parseFactor(); }  // a leading - flips the sign:  -x
      return parsePrimary();
    }

    // A single value: a number, a cell name, a SUM/AVG call, or a bracketed sum.
    function parsePrimary() {
      const t = peek();
      if (!t) throw new FormulaError(SYNTAX);

      if (t.type === 'number') { next(); return t.value; }              // just a number, like 10

      if (t.type === 'ref') { next(); return cellRefAsNumber(t.value); } // a cell, like A1 -> go fetch its value

      if (t.type === '(') {                       // a bracketed sum: ( ... )
        next();                                   // step past the "("
        const value = parseExpression();          // work out everything inside
        if (!peek() || peek().type !== ')') throw new FormulaError(SYNTAX);  // must be a matching ")"
        next();                                   // step past the ")"
        return value;
      }

      if (t.type === 'name') {                    // a function call: SUM( ... ) or AVG( ... )
        next();                                   // step past the name
        if (!peek() || peek().type !== '(') throw new FormulaError(SYNTAX);  // a "(" must come next
        next();
        const refs = parseRange();                // read the A1:A5 part
        if (!peek() || peek().type !== ')') throw new FormulaError(SYNTAX);  // then a ")"
        next();
        return applyFunction(t.value, refs);      // actually do the SUM or AVG
      }

      throw new FormulaError(SYNTAX);             // none of the above -> the formula is broken
    }

    // Reads a range, which is written "cell : cell", e.g. A1:A5
    // It expects exactly: a cell name, then a ":", then another cell name.
    function parseRange() {
      const a = peek();
      if (!a || a.type !== 'ref') throw new FormulaError(SYNTAX);   // need a cell name first
      next();
      if (!peek() || peek().type !== ':') throw new FormulaError(SYNTAX);  // then a ":"
      next();
      const b = peek();
      if (!b || b.type !== 'ref') throw new FormulaError(SYNTAX);   // then another cell name
      next();
      return rangeRefs(a.value, b.value);   // turn "A1","A5" into the full list of cells between them
    }

    // After reading the whole formula, there should be no pieces left over.
    // If there are (like the stray "2" in "=1 2"), the formula is broken.
    function expectEnd() {
      if (pos < tokens.length) throw new FormulaError(SYNTAX);
    }

    // These are the only two things makeParser lets the outside use.
    return { parseExpression, expectEnd };
  }

  // ----- small helpers the parser uses -----

  // Look up a single cell's value as a number, but first make sure the cell is
  function cellRefAsNumber(refString) {
    const { col, row } = parseRef(refString);
    if (!refInGrid(col, row)) throw new FormulaError(CONFIG.ERRORS.SYNTAX);
    return refAsNumber(refString);
  }

  // Turn a range like "A1:B2" into the list of every cell inside that
  // rectangle: "A1","B1","A2","B2". We find the top-left and bottom-right
  // corners (using min/max in case the user typed them back-to-front), then
  // loop over every row and column in between.
  function rangeRefs(aString, bString) {
    const a = parseRef(aString);
    const b = parseRef(bString);
    const c1 = Math.min(a.col, b.col), c2 = Math.max(a.col, b.col);
    const r1 = Math.min(a.row, b.row), r2 = Math.max(a.row, b.row);
    const refs = [];
    for (let r = r1; r <= r2; r++) {
      for (let c = c1; c <= c2; c++) {
        if (!refInGrid(c, r)) throw new FormulaError(CONFIG.ERRORS.SYNTAX);
        refs.push(colName(c) + r);
      }
    }
    return refs;
  }

  // Actually run SUM or AVG over the list of cells in the range.
  function applyFunction(name, refs) {
    // Turn every cell in the range into a number (blank->0, words->#VALUE!,
    // and any error gets passed along). "map" makes a new list by doing the
    // same thing to each item.
    const numbers = refs.map(refAsNumber);
    if (name === 'SUM') {
      // "reduce" adds the list up into a single total, starting from 0.
      return numbers.reduce((a, b) => a + b, 0);
    }
    if (name === 'AVG') {
      if (refs.length === 0) throw new FormulaError(CONFIG.ERRORS.SYNTAX);
      return numbers.reduce((a, b) => a + b, 0) / refs.length;   // total divided by how many = average
    }
    throw new FormulaError(CONFIG.ERRORS.SYNTAX);   // a function name we don't recognise
  }

  // This is the engine's "public counter": only these five functions are
  // handed out for app.js to use.
  return { colName, colIndex, setRaw, getRaw, getDisplay };
})();   // The "()" runs the function right now, building Engine.
