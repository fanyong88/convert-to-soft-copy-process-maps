# Data Model

## process_maps
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| user_id | uuid nullable | owner scope (populated at lock-down sprint) |
| created_at | timestamptz | default now() |
| name | text | e.g. "Invoice Approval Process" |
| client_name | text | e.g. "Acme Corp" |
| photo_url | text | Supabase Storage URL |
| status | text | `draft` \| `reviewed` |
| notes | text | optional consultant notes |

## process_steps
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | |
| created_at | timestamptz | |
| map_id | uuid FK → process_maps | cascade delete |
| sequence | integer | display order |
| label | text | step name — **AI-generated** |
| step_type | text | `start` \| `task` \| `decision` \| `end` |
| notes | text | optional |
| label_source | text | AI field: `ai_vision` \| `manual` |
| label_confidence | numeric | AI field: 0–1 |
| label_review_status | text | AI field: `unreviewed` \| `reviewed` \| `overridden` |

## export_logs
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | |
| created_at | timestamptz | |
| map_id | uuid FK → process_maps | |
| export_format | text | `excel` \| `drawio_xml` |
| triggered_by | text | consultant identifier (pre-auth: `anonymous`) |

## RLS
- All tables: permissive v1 policies (select + all for anonymous) 
- Lock-down sprint: replace with `auth.uid() = user_id` owner policies
