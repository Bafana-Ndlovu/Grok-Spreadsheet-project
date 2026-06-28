// config.js
// All the "settings" for the spreadsheet live here in ONE place. If you want a
// bigger grid or different error wording, you change it here and nowhere else.
const CONFIG = {
  COLUMNS: 10,            // how many columns - 10 gives A .. J
  ROWS: 20,              // how many rows - 20 gives 1 .. 20

  // The name the browser saves your sheet under, so a refresh doesn't wipe it.
  STORAGE_KEY: 'mini-spreadsheet',

  // The exact text we show in a cell when something goes wrong.
  ERRORS: {
    CIRCULAR: '#CIRCULAR!', // a cell ends up needing itself a loop
    DIV_ZERO: '#DIV/0!',    // tried to divide by zero
    VALUE:    '#VALUE!',    // tried to do maths on words
    SYNTAX:   '#ERROR!',    // the formula is written wrongly
  },
};
