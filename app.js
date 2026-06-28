// app.js — THE SCREEN (it draws the grid and listens for clicks/typing).
//
// This file is the opposite of engine.js: it does NO maths. The simple rule.
// that keeps the project tidy is:
//   * to SHOW a cell, it asks the engine: Engine.getDisplay(ref)
//   * when the user types something, it tells the engine: Engine.setRaw(ref, text)
//     and then redraws every cell.
// So the screen and the "brain" only ever talk through those few functions.

// Everything is wrapped in a function that runs itself (see the "()" at the
// bottom) so our variable names stay private and don't clash with engine.js.
(function () {
  // Grab the three parts of the page we need to work with.
  const gridWrap   = document.getElementById('grid');         // the box the table goes in
  const formulaBar = document.getElementById('formula-bar');  // the text box above the grid
  const cellLabel  = document.getElementById('cell-label');   // the little "A1" label next to it
  const clearBtn   = document.getElementById('clear-btn');    // the "Clear" button
  const saveStatus = document.getElementById('save-status');  // the little "Saved ✓" note

  const ERROR_CODES = Object.values(CONFIG.ERRORS);  // the list of error texts, e.g. ["#CIRCULAR!", ...]
  let selected = null;     // the name of the cell currently clicked, e.g. "A1" (null = none yet)
  const cells = {};        // for each cell name, the actual <td> box on the page that shows it

  // ----- build the grid using the sizes from CONFIG (so we never type 10 or 20 by hand) -----
  function build() {
    const table = document.createElement('table');   // make a <table> to hold everything

    // The top row: an empty corner box, then the column letters A, B, C ...
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    headRow.appendChild(document.createElement('th'));   // the empty top-left corner
    for (let c = 0; c < CONFIG.COLUMNS; c++) {
      const th = document.createElement('th');
      th.textContent = Engine.colName(c);                // 0 -> "A", 1 -> "B", ...
      headRow.appendChild(th);
    }
    thead.appendChild(headRow);
    table.appendChild(thead);

    // Now one row for each spreadsheet row: the row number on the left, then
    // one editable cell for each column.
    const tbody = document.createElement('tbody');
    for (let r = 1; r <= CONFIG.ROWS; r++) {
      const tr = document.createElement('tr');

      const rowHead = document.createElement('th');      // the row-number box on the left
      rowHead.textContent = r;
      tr.appendChild(rowHead);

      for (let c = 0; c < CONFIG.COLUMNS; c++) {
        const ref = Engine.colName(c) + r;               // build the cell's name, e.g. "B3"
        const td = document.createElement('td');
        td.className = 'cell';
        td.dataset.ref = ref;                            // remember this box's name on the element itself
        td.addEventListener('click', () => select(ref));        // one click selects the cell
        td.addEventListener('dblclick', () => focusBarAtEnd()); // double-click jumps into the formula bar
        cells[ref] = td;                                 // save the box so we can update it later
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    gridWrap.appendChild(table);    // put the finished table on the page
    refreshAll();                   // fill in any starting values
  }

  // Select (highlight) a cell. The cell on the grid keeps showing its RESULT,
  // while the formula bar shows what was actually TYPED. Showing the result in
  // the grid but the raw text in the bar is exactly what the brief asks for.
  function select(ref) {
    selected = ref;
    cellLabel.textContent = ref;                  // show the name, e.g. "A1", next to the bar
    formulaBar.value = Engine.getRaw(ref);        // put the typed text into the bar
    Object.values(cells).forEach((td) => td.classList.remove('selected'));  // un-highlight all cells
    cells[ref].classList.add('selected');         // highlight just this one
  }

  // Called when the user finishes an edit: give the text to the engine to
  // store, then redraw the grid so every affected cell updates.
  function commit() {
    if (!selected) return;                              // nothing selected = nothing to do
    if (formulaBar.value === Engine.getRaw(selected)) return;  // unchanged = no need to save
    Engine.setRaw(selected, formulaBar.value);
    refreshAll();
    showSaved();                                        // flash the "Saved ✓" note
  }

  // Go through EVERY cell and ask the engine what it should show now, then put
  // that text in the box. For our small grid this is instant.
  // explains how a much bigger grid would update only the changed cells.
  function refreshAll() {
    Object.keys(cells).forEach((ref) => {
      const text = Engine.getDisplay(ref);
      const td = cells[ref];
      td.textContent = text;
      // Work out how to colour the cell: red for errors, left-aligned for words.
      const isError = ERROR_CODES.includes(text);
      const isText  = text !== '' && !isError && Number.isNaN(Number(text));
      td.classList.toggle('error', isError);      // add/remove the "error" style
      td.classList.toggle('text', isText);        // add/remove the "text" style
    });
  }

  // Put the typing cursor into the formula bar, at the END of whatever is there.
  function focusBarAtEnd() {
    formulaBar.focus();
    const end = formulaBar.value.length;
    formulaBar.setSelectionRange(end, end);
  }

  // Briefly flash a little "Saved ✓" note so the user can see their work was
  // stored. Each save resets the timer, so it stays up while you keep typing,
  // then fades away about 1.5 seconds after you stop.
  let saveTimer = null;
  function showSaved(message = 'Saved ✓') {
    saveStatus.textContent = message;
    saveStatus.classList.add('visible');
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveStatus.classList.remove('visible'), 1500);
  }

  // ----- keys pressed WHILE typing in the formula bar -----
  formulaBar.addEventListener('keydown', (e) => {
    // Enter = save this cell and drop down to the one below (like real spreadsheets).
    if (e.key === 'Enter') { commit(); moveSelection('ArrowDown'); }
    // Escape = cancel: put back the original text and leave the bar.
    if (e.key === 'Escape') { formulaBar.value = Engine.getRaw(selected); formulaBar.blur(); }
  });
  // Clicking away from the bar ("blur") also counts as finishing the edit.
  formulaBar.addEventListener('blur', commit);

  // ----- keys pressed while a cell is selected but the bar is NOT focused -----
  // This makes it feel like you're typing straight "into" the selected cell.
  document.addEventListener('keydown', (e) => {
    if (!selected || document.activeElement === formulaBar) return;  // ignore if no cell, or already typing in the bar

    if (e.key === 'Enter') { focusBarAtEnd(); e.preventDefault(); return; }  // Enter opens the cell for editing

    // Backspace or Delete empties the cell.
    if (e.key === 'Backspace' || e.key === 'Delete') {
      if (Engine.getRaw(selected) !== '') {   // only if there was something to clear
        Engine.setRaw(selected, '');
        refreshAll();
        showSaved();
      }
      formulaBar.value = '';
      e.preventDefault();
      return;
    }

    // Arrow keys move the selection to a neighbouring cell.
    if (e.key.startsWith('Arrow')) { moveSelection(e.key); e.preventDefault(); return; }

    // Typing any normal single character starts a fresh edit beginning with it.
    // (The ctrl/meta/alt checks let shortcuts like Ctrl+C still work normally.)
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      formulaBar.value = e.key;
      focusBarAtEnd();
      e.preventDefault();
    }
  });

  // Move the selected cell up/down/left/right using the arrow keys.
  function moveSelection(key) {
    if (!selected) return;
    // Split the current name (like "B3") back into a column number and row number.
    const match = /^([A-Z]+)(\d+)$/.exec(selected);
    let col = Engine.colIndex(match[1]);
    let row = Number(match[2]);
    if (key === 'ArrowUp')    row--;
    if (key === 'ArrowDown')  row++;
    if (key === 'ArrowLeft')  col--;
    if (key === 'ArrowRight') col++;
    // Don't move off the edge of the grid.
    if (col < 0 || col >= CONFIG.COLUMNS || row < 1 || row > CONFIG.ROWS) return;
    const ref = Engine.colName(col) + row;        // build the new cell's name
    select(ref);
    cells[ref].scrollIntoView({ block: 'nearest', inline: 'nearest' });  // scroll it into view if needed
  }

  // The "Clear" button empties every cell (and the saved copy), after a quick
  // "are you sure?" so it isn't pressed by accident.
  clearBtn.addEventListener('click', () => {
    if (!window.confirm('Clear the whole sheet? This cannot be undone.')) return;
    Engine.clearAll();
    selected = null;
    cellLabel.textContent = '—';   // reset the label back to a dash "—"
    formulaBar.value = '';
    Object.values(cells).forEach((td) => td.classList.remove('selected'));
    refreshAll();
    showSaved('Cleared ✓');
  });

  build();   // kick everything off: draw the grid
})();        // The "()" runs this whole setup function right away.
