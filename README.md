Mini Spreadsheet Engine
Overview
Mini Spreadsheet Engine is a browser-based spreadsheet application built using HTML5, CSS3, and Vanilla JavaScript without the use of external libraries or frameworks.

The aim of this project is to demonstrate the core principles behind spreadsheet software such as Microsoft Excel and Google Sheets by allowing users to enter numbers, text, and formulas into cells. The spreadsheet evaluates formulas, updates dependent cells automatically, handles common spreadsheet errors, and provides a clean user interface.

Unlike a commercial spreadsheet application, this project focuses on demonstrating the logic behind spreadsheet engines in a way that is easier to understand and maintain.

Team Members
This project was completed collaboratively by:

Bheki Buthelezi

Sijabulile Ncube

Bafana Ndlovu

Mhlengi Ngwenya

Bao Kekana

Team Collaboration
The project was developed using a collaborative Git workflow.

Each team member contributed through:

Creating feature branches

Writing and improving code

Reviewing ideas during team meetings

Testing functionality

Improving readability and maintainability

Preparing documentation

Assisting with the project presentation

The final project represents the combined effort of the entire team.

Technologies Used
HTML5

CSS3

Vanilla JavaScript (ES6)

DOM Manipulation

Browser Local Storage (where applicable)

Git

GitHub

Visual Studio Code

Project Structure
MiniSpreadsheet

│
├── index.html
├── styles.css
├── config.js
├── engine.js
├── app.js
└── README.md
Each file has a specific responsibility.

Separating responsibilities keeps the project easier to understand, debug and extend.

Project Architecture
The application follows a simple layered architecture.

User

↓

User Interface
(index.html)

↓

Styling
(styles.css)

↓

Application Logic
(app.js)

↓

Spreadsheet Engine
(engine.js)

↓

Configuration
(config.js)
Each layer has one responsibility.

File Breakdown
index.html
This file creates the user interface.

It contains:

Application heading

Formula bar

Selected cell indicator

Spreadsheet container

It also loads the JavaScript files in the correct order.

config.js

↓

engine.js

↓

app.js
This order is important because:

app.js depends on Engine.

Engine depends on CONFIG.

Loading them in another order would cause the application to fail.

styles.css
This file controls the appearance of the spreadsheet.

It is responsible for:

Layout

Responsive design

Formula bar styling

Grid styling

Selected cell highlighting

Error colouring

Text alignment

Mobile responsiveness

Numbers are right aligned while text is left aligned to improve readability.

Error cells are displayed in red to make them easy to identify.

config.js
This file stores all configurable settings for the spreadsheet.

Examples include:

Number of columns

Number of rows

Spreadsheet error messages

Columns = 10

Rows = 20
Keeping these settings in one file means the spreadsheet can easily be resized without changing the rest of the application.

engine.js
This is the heart (brain) of the spreadsheet.

It contains all calculation logic.

The engine is completely independent from the user interface.

Its responsibilities include:

Storing cell data

Evaluating formulas

Tokenizing formulas

Parsing expressions

Performing calculations

Handling operator precedence

Supporting spreadsheet functions

Detecting errors

Detecting circular references

Returning calculated values

The engine never interacts directly with HTML.

Instead, it exposes a small public API used by app.js.

app.js
This file controls everything the user sees and interacts with.

Its responsibilities include:

Creating the spreadsheet grid

Handling mouse clicks

Handling keyboard input

Updating the formula bar

Refreshing the display

Moving between cells

Highlighting the selected cell

Unlike engine.js, app.js performs no mathematical calculations.

Whenever it needs a value, it asks the Engine.

This separation makes the project easier to maintain.

Spreadsheet Features
The spreadsheet supports:

✅ Numbers

Example

25
✅ Text

Example

Hello
✅ Formulas

Example

=A1+B1
✅ Addition

=A1+B1
✅ Subtraction

=A1-B1
✅ Multiplication

=A1*B1
✅ Division

=A1/B1
✅ Parentheses

=(A1+B1)*2
Built-in Functions
SUM
Adds all values within a selected range.

Example

=SUM(A1:A5)
AVG
Calculates the average value of a range.

Example

=AVG(A1:A5)
Automatic Recalculation
One of the most important spreadsheet features is automatic recalculation.

Example:

A1 = 5

B1 = 10

C1 = =A1+B1
C1 displays

15
If A1 changes to

20
then

C1 automatically becomes 30
without editing the formula.

Formula Parsing
Instead of using JavaScript's eval() function, the spreadsheet evaluates formulas itself.

The process follows four stages:

Step 1
Tokenize

The formula is split into smaller pieces.

Example

=A1+10*2
becomes

A1

+

10

*

2
Step 2
Parse

The parser reads the tokens while respecting mathematical precedence.

Multiplication and division happen before addition and subtraction.

Step 3
Resolve Cell References

When a formula references another cell, the engine retrieves that cell's value before completing the calculation.

Step 4
Display Result

The calculated value is returned to app.js and displayed in the spreadsheet.

Error Handling
The spreadsheet detects several common spreadsheet errors.

Division by Zero
=A1/0
Displays

#DIV/0!
Invalid Text Arithmetic
A1 = Hello

B1 = =A1+5
Displays

#VALUE!
Circular References
Example

A1 = =B1

B1 = =A1
Displays

#CIRCULAR!
Invalid Formula
Incorrect syntax produces

#ERROR!
Keyboard Navigation
The spreadsheet supports keyboard shortcuts.

Key	Action
Enter	Save current cell and move down
Arrow Keys	Move between cells
Delete	Clear selected cell
Backspace	Clear selected cell
Escape	Cancel editing
Double Click	Edit cell using formula bar
Why Separate app.js and engine.js?
This project follows the principle of Separation of Concerns.

engine.js focuses only on spreadsheet calculations.

app.js focuses only on displaying information and responding to user actions.

This makes the project:

Easier to understand

Easier to test

Easier to maintain

Easier to extend with new features

Future Improvements
Possible future enhancements include:

Copy and Paste

Undo / Redo

Additional spreadsheet functions

CSV Import

CSV Export

Dark Mode

Formula autocomplete

Larger configurable grids

Cell formatting (bold, colours, fonts)

Conclusion
Mini Spreadsheet Engine demonstrates the core principles behind spreadsheet software using only HTML, CSS and Vanilla JavaScript.

By separating configuration, spreadsheet logic and user interface into different modules, the project remains organised, readable and maintainable.

The project also provided valuable experience in collaborative software development using Git, GitHub, feature branches, code reviews, and team communication.
