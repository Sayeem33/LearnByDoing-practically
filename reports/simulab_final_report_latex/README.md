# SimuLab Final Report LaTeX Package

This folder contains a KUET CSE 3200 style final project report draft for:

**SimuLab: Virtual Lab and Concept Learning Platform**

## Files

- `main.tex` - full LaTeX report source with title pages, front matter, chapters, tables, figure placeholders, appendices, and references.
- `diagrams_mermaid.md` - Mermaid source code for all requested diagrams:
  - Use Case Diagram
  - Activity Diagram
  - DFD
  - Control Flow Diagram
  - Class Diagram
  - Gantt Chart
  - State Diagram
  - Sequence Diagram

## How to compile

From this folder, run:

```bash
pdflatex main.tex
pdflatex main.tex
```

Running twice updates the table of contents, list of tables, and list of figures.

If you use Overleaf, upload `main.tex` and compile with pdfLaTeX.

## Before final submission

Replace the placeholders in `main.tex`:

- `[Student Name]`
- `[Roll Number]`
- `[Second Student Name, if any]`
- `[Second Roll Number, if any]`
- `[Supervisor Name]`
- `[Supervisor Designation]`
- `[Submission Month, Year]`

The report includes diagram placeholders in the LaTeX file. Use the Mermaid code from `diagrams_mermaid.md` to render diagrams as PNG/SVG, then insert them into the matching figure locations.
