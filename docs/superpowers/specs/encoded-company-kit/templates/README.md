# Encoded company templates

Draft of the kit's `templates/` folder (spec section 1). One template per page
type, filled in the order of the three stages:

| Stage | Template | Becomes | One per |
|---|---|---|---|
| 2 | `company.md` | `companies/<tenant>.md` | tenant |
| 2 | `rule.md` | `rules/<slug>.md` | rule |
| 3 | `department.md` | `departments/<slug>.md` | department |
| 3 | `agent.md` | `agents/<slug>.md` | agent |
| 3 | `job.md` | `jobs/<slug>.md` | recurring job |
| 3 | `output.md` | `outputs/<department>/YYYY-MM-DD-<job>.md` | agent run |

## How to fill one

1. Copy the template to its directory. Never rename or move the page afterwards:
   the path is the slug and the slug is the identity.
2. Replace every `<angle bracket>` value. Delete the `<!-- guide -->` comments
   once the section is filled.
3. A section with nothing true to put in it says so in one line
   ("No written SOP for this step."). Absence is a finding. Never invent content
   so the page looks complete.
4. Write the current state above the rule, dated events below it.
5. Relationship lines use the verbs in spec section 2, as `verb:: [[path]]`.
6. Commit. Edits reach retrieval only after commit.

## About the examples

Each template ends with a short worked example for a fictional twelve-person
bookkeeping firm, "Example Co". It is fictional on purpose: the kit carries no
tenant's content, so it can be set up for any client.
