# Grok Spreadsheet Project

A browser-based spreadsheet application built using **HTML5**, **CSS3**, and **Vanilla JavaScript**.

---

# Project Overview

The **Grok Spreadsheet Project** is a lightweight spreadsheet application developed to demonstrate the core principles behind spreadsheet software such as Microsoft Excel and Google Sheets.

The application allows users to:

- Enter numbers, text and formulas
- Perform mathematical calculations
- Reference values from other cells
- Automatically recalculate formulas when dependent values change
- Display spreadsheet errors
- Navigate using both the mouse and keyboard

The project was developed using only HTML, CSS and Vanilla JavaScript without relying on external frameworks or libraries.

---

# Live Demo

## Netlify Deployment

**Live Application**

Add your Netlify deployment link here.

```text
https://your-netlify-link.netlify.app
```

---

# Loom Presentation

Add your Loom presentation link here.

```text
https://www.loom.com/share/your-video-link
```

---

# Team Members

- Bheki Buthelezi
- Sijabulile Ncube
- Bafana Ndlovu
- Mhlengi Ngwenya
- Bao Kekana

---

# Team Collaboration

This project was completed using a collaborative GitHub workflow.

Every team member contributed throughout the project by sharing ideas, writing code, participating in meetings, testing functionality and helping refine the final application.

---

## Initial Repository

The project began with an initial GitHub repository created by **Bheki Buthelezi**.

Bheki also introduced the team to the GitHub workflow by demonstrating:

- Repository cloning
- Creating feature branches
- Making commits
- Pushing changes to GitHub
- Collaborative development using Git

This provided the foundation for how the team worked throughout the project.

---

## Feature Branch Development

Before deciding on the final solution, every team member created their own feature branch from the initial repository.

Feature branches were created by:

- Bheki Buthelezi
- Sijabulile Ncube
- Bafana Ndlovu
- Mhlengi Ngwenya
- Bao Kekana

Each branch explored different layouts, implementations and ideas.

This gave the team the opportunity to compare different approaches before selecting the final direction of the project.

---

## Google Meet Collaboration

Throughout the project, the team held several Google Meet sessions.

These meetings were used to:

- Discuss different spreadsheet ideas
- Compare implementations from each feature branch
- Decide which solution best met the project requirements
- Solve technical challenges together
- Review progress
- Refine the final application
- Prepare for the presentation

Every important technical decision was discussed and agreed upon collectively.

---

## Creating the Final Repository

After reviewing the different feature branches and agreeing on the final direction, the team created a **new GitHub repository** for the final submission.

The new repository combined the best ideas from the different branches.

From that point onwards, the project was refined collaboratively through continuous discussion, testing and improvements until the final version was completed.

---

## Team Decisions

As a team we collectively decided:

- Which spreadsheet implementation to use
- Which ideas from the different feature branches would be included
- Which deployment platform to use (Netlify or Vercel)
- Which screen-recording software would be used for the Loom presentation
- How presentation responsibilities would be shared
- How the final repository would be organised

These decisions ensured that every team member contributed to the final project.

---

# Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript (ES6)
- DOM Manipulation
- Git
- GitHub
- Visual Studio Code

---

# Project Structure

```text
Grok Spreadsheet Project
│
├── index.html
├── styles.css
├── config.js
├── engine.js
├── app.js
└── README.md
```

Each file has a dedicated responsibility, making the application easier to understand and maintain.

---

# Application Architecture

```text
User
 │
 ▼
index.html
(User Interface)
 │
 ▼
styles.css
(Presentation Layer)
 │
 ▼
app.js
(User Interaction)
 │
 ▼
engine.js
(Spreadsheet Logic)
 │
 ▼
config.js
(Application Settings)
```

The project follows the principle of **Separation of Concerns** by giving each file a single responsibility.

---

# File Responsibilities

## index.html

Responsible for:

- Building the application layout
- Displaying the formula bar
- Displaying the active cell reference
- Creating the spreadsheet container
- Loading JavaScript files in the correct order

---

## styles.css

Responsible for:

- Overall application layout
- Spreadsheet styling
- Formula bar styling
- Selected cell highlighting
- Error styling
- Responsive design
- Text alignment

---

## config.js

Stores configurable application settings including:

- Number of rows
- Number of columns
- Spreadsheet error messages

Keeping these settings in one file allows the spreadsheet to be resized without modifying the application logic.

---

## engine.js

The spreadsheet engine is the core of the application.

Its responsibilities include:

- Storing cell values
- Evaluating formulas
- Tokenizing formulas
- Parsing mathematical expressions
- Resolving cell references
- Performing calculations
- Detecting circular references
- Handling spreadsheet errors
- Returning calculated results

The engine performs all calculations independently of the user interface.

---

## app.js

This file manages user interaction.

Responsibilities include:

- Building the spreadsheet grid
- Selecting cells
- Updating the formula bar
- Handling keyboard navigation
- Refreshing displayed values
- Requesting calculations from the engine

app.js never performs calculations itself. Whenever a calculation is required, it asks engine.js to calculate the result.

---

# Features

The spreadsheet currently supports:

- Numbers
- Text
- Cell references
- Mathematical formulas
- Addition
- Subtraction
- Multiplication
- Division
- Parentheses
- SUM()
- AVG()
- Automatic recalculation
- Formula bar editing
- Keyboard navigation
- Spreadsheet error handling
- Responsive layout

---

# Example

Input

```text
A1 = 5

B1 = 10

C1 = =A1+B1
```

Output

```text
15
```

If A1 changes to **20**, C1 automatically updates to **30** because the spreadsheet recalculates dependent formulas.

---

# Spreadsheet Errors

| Error | Meaning |
|--------|---------|
| #DIV/0! | Division by zero |
| #VALUE! | Arithmetic performed on text |
| #CIRCULAR! | Circular reference detected |
| #ERROR! | Invalid formula syntax |

---

# Keyboard Shortcuts

| Key | Action |
|------|--------|
| Enter | Save and move to the next row |
| Arrow Keys | Navigate between cells |
| Delete | Clear selected cell |
| Backspace | Clear selected cell |
| Escape | Cancel editing |
| Double Click | Edit using the formula bar |

---

# Future Enhancements

The current implementation provides a strong foundation for a browser-based spreadsheet.

Future improvements could include:

- Additional spreadsheet functions such as MIN(), MAX() and COUNT()
- Copy and paste functionality
- Undo and redo support
- CSV import and export
- Formula auto-complete
- Cell formatting (fonts, colours and borders)
- Larger configurable spreadsheets
- Improved accessibility features
- Performance optimisation for larger datasets

These enhancements would extend the application's capabilities while building on the modular architecture already developed by the team.

---

# Reflection

This project strengthened our understanding of:

- JavaScript fundamentals
- DOM manipulation
- Formula parsing
- Modular application design
- Git and GitHub collaboration
- Feature branch workflows
- Team communication
- Collaborative software development

Working together allowed us to combine ideas, review each other's work, refine our implementation through discussion and deliver a solution that reflects the contributions of every team member.

---

# Acknowledgements

We would like to acknowledge every member of the team for their commitment throughout the project.

From creating the initial repository and feature branches, to participating in Google Meet discussions, refining the application, deciding on deployment and presentation tools, and preparing the final submission, every team member contributed to the success of the Grok Spreadsheet Project.
