# Test Plan

## Primary Success Scenario (manual steps)
1. Open the app homepage — confirm 3 seed maps are visible with names, client, status
2. Click **New Map** — form appears with fields: Map Name, Client Name, Photo upload
3. Enter "Purchase Order Flow", client "Test Co", upload a flipchart photo (JPG/PNG)
4. Submit — confirm map appears in list with status `draft`
5. Open the map — confirm photo thumbnail visible and "Analysing your map..." spinner shows
6. Wait up to 15 seconds — confirm process steps table populates with ≥ 1 row
7. Confirm steps have label, type, and confidence badges
8. Edit a step label — type a new name, press Save — refresh page — confirm new label persists
9. Change a step type from `task` to `decision` — save — confirm persists
10. Click **Mark as Reviewed** — confirm map status changes to `reviewed`
11. Click **Export → Excel** — confirm .xlsx downloads and opens with correct rows in Excel
12. Click **Export → DrawIO XML** — confirm .xml downloads and opens in draw.io showing connected shapes
13. Confirm export_logs table has two new rows

## Empty State Tests
- New account / fresh DB: homepage shows "No maps yet — upload your first flipchart" (not a blank screen)
- Map with zero steps: Export buttons disabled with tooltip "Add steps before exporting"

## Error State Tests
- Upload a non-image file (e.g. .pdf) — confirm validation error, no DB row created
- Simulate AI failure (disconnect API key temporarily) — confirm error banner, manual step entry still works
- Export with zero steps — confirm button is disabled, not a silent empty file

## Edge Cases
- Map name left blank — form blocks submission with validation message
- Photo > 10 MB — confirm size limit error message before upload attempt
- Rapid double-click on Export — confirm only one export_logs row is written (debounce check)
