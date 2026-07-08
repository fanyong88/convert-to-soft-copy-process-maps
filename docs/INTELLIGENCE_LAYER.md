# Intelligence Layer

## Messy Input
A JPEG/PNG photo of a hand-drawn flipchart: boxes, diamonds, arrows, handwritten labels, varying legibility, multiple colours, partial erasures.

## Extraction Prompt Goal
Send photo to GPT-4o Vision with a system prompt instructing it to return a structured JSON list of process steps in reading/flow order.

## Auto-Structure Schema (AI response parsed to this)
```json
{
  "steps": [
    {
      "sequence": 1,
      "label": "Receive Invoice",
      "step_type": "start",
      "confidence": 0.95
    },
    {
      "sequence": 2,
      "label": "Amount > $10,000?",
      "step_type": "decision",
      "confidence": 0.72
    }
  ]
}
```

## Events to Track
- Photo uploaded
- AI extraction completed (success / fail)
- Step edited manually (triggers `review_status = overridden`)
- Export downloaded

## Confidence Scoring
- `>= 0.85` — shown normally, green badge
- `0.70 – 0.84` — shown with amber flag "Check this step"
- `< 0.70` — shown with red flag "AI unsure — please verify"
- All thresholds rule-based; no ML model needed in v1

## What Gets Ranked
- Steps with `review_status = unreviewed` AND `confidence < 0.70` surface at the top of the review checklist

## v1 vs Later
- **v1:** GPT-4o Vision → JSON parse → confidence flags → manual correction
- **Later:** Fine-tuned extraction model on consultant-corrected maps; arrow/connection inference for complex branching
