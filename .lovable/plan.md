# SHG बचत रजिस्टर — Excel (.xlsx) clone

Deliver a single landscape A4 `.xlsx` file that visually mirrors the उड़ान महिला मंच बचत रजिस्टर from the uploaded photo. No web app — just a downloadable Excel artifact.

## Output

- File: `/mnt/documents/SHG_Bachat_Register.xlsx`
- Single sheet, page setup: A4, landscape, fit-to-1-page-wide, narrow margins, print gridlines off (cell borders provide the grid).
- Font: Arial 10 (compact); headers bold; Hindi text rendered as Unicode (openpyxl handles UTF-8 fine).

## Sheet layout (top → bottom)

1. **Header band (rows 1–2)**
   - A1: `उड़ान महिला मंच, अलवर (राजस्थान)` (bold, larger)
   - Right side: `उड़ान ______ स्वयं सहायता समूह, ग्राम ______   दिनांक ______   मीटिंग नं ______`
   - Row 2 left: `बचत रजिस्टर` (boxed/bold)   Right span: `तलपट` (bold, centered over तलपट columns)

2. **Main table (rows 3–22)** — merged 2-row header, then 16 member rows + `कुल योग` row.

   Columns (left → right):
   | # | Column | Header |
   |---|---|---|
   | A | क्र.सं | |
   | B | सदस्य का नाम | (wide) |
   | C | उपस्थिति | |
   | D | बचत जमा | |
   | E | समूह — किस्त जमा | (group header "समूह" merged over E:F) |
   | F | समूह — ब्याज | |
   | G | बैंक — किस्त जमा | (group header "बैंक" merged over G:H) |
   | H | बैंक — ब्याज | |
   | I | समूह — शेष ऋण | (group "समूह" merged I) |
   | J | बैंक — शेष ऋण | (group "बैंक" merged J) |
   | K | अन्य | |
   | L | इस माह उधार दिया | |
   | M | बचत राशि | (under तलपट) |
   | N | समूह उधार राशि | (under तलपट) |
   | O | बैंक उधार राशि | (under तलपट) |

   - Rows 5–20: serial 1–16 prefilled in column A.
   - Row 21: `कुल योग` with `=SUM(...)` formulas for columns D–O.

3. **Bottom panels (rows 23–35)** — two side-by-side boxes:
   - **आज का नकद विवरण :-** (columns A–E)
     - Sub-headers: `आमद | (राशि) | खर्चा | (राशि)`
     - आमद rows: पिछला नकद शेष, आज की बचत, उधार वापसी समूह, ब्याज समूह, उधार वापसी बैंक, ब्याज बैंक, पैनल्टी बैंक, पैनल्टी समूह, अन्य
     - खर्चा rows: बैंक उधार दिया, समूह उधार दिया, समूह खर्च मुंशीभत्ता एवं स्टेशनरी, फैडरेशन सदस्यता शुल्क, बैंक लोन पर खर्च, बैंक किस्त, अन्य, …, योग, आज का नकद शेष
     - Final `कुल योग` row with SUM formulas.
   - **तलपट का विवरण :-** (columns G–K)
     - आमद rows: सदस्यों की बचत, समूह ब्याज, बैंक ब्याज, समूह पैनल्टी, बैंक पैनल्टी, बैंक लोन, फैडरेशन लोन, अन्य
     - खर्चा rows: सदस्यों को समूह उधार, सदस्यों को बैंक उधार, बैंक बचत खाता बैंक…, बैंक बचत खाता बैंक…, समूह खर्च मुंशीभत्ता एवं फैडरेशन सदस्यता शुल्क, बैंक लोन पर खर्च, अन्य खर्च, बैंक की कुल किस्त पिछले माह तक, बैंक की किस्त इस माह किस्त नं…, आज का नकद शेष
     - Final `कुल योग` row with SUM formulas.

4. **Signature row (last row)**
   - Four evenly spaced labels: `अध्यक्ष`   `सचिव`   `कोषाध्यक्ष`   `कलस्टर कार्यकर्त्ता`

## Styling rules

- All table cells: thin black borders on all sides (`Side(style='thin', color='000000')`).
- Header cells: bold, center-aligned, wrap text, light row height bump.
- Body cells: top-aligned, wrap text, row height ~22.
- Column widths tuned for A4 landscape fit (narrow for क्र.सं/उपस्थिति, wide for सदस्य का नाम).
- Page setup: `sheet.page_setup.orientation = 'landscape'`, `paperSize = A4`, `fitToWidth=1`, `fitToHeight=1`; print area set to the used range.

## Formulas

- Column totals row (row 21): `=SUM(D5:D20)` … `=SUM(O5:O20)`.
- Each bottom panel's `योग` and `कुल योग` cells: `=SUM(...)` over their राशि columns.
- All raw inputs left blank for the user to fill.

## Build steps

1. Write `/tmp/build_register.py` using openpyxl: create workbook, apply merges, borders, fonts, fills, column widths, page setup, formulas.
2. Run it to produce `/mnt/documents/SHG_Bachat_Register.xlsx`.
3. Recalculate formulas with the skill's `recalculate_formulas.py`; confirm zero errors.
4. **QA**: convert the sheet to PDF/PNG via LibreOffice headless and inspect the rendered page to verify it visually matches the photo (column groupings under समूह/बैंक/तलपट, signature row, no clipped Hindi text, landscape fit). Fix and re-run if anything is off.
5. Emit a `<presentation-artifact>` tag pointing at the final .xlsx.

## Out of scope

- The large right-side blank notes/lines area from the photo (per earlier requirement — removed).
- Multiple sheets / month archive.
- Data validation, dropdowns, macros.
