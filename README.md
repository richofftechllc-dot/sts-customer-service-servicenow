# STS Customer Service — ServiceNow Scoped Application

> **Interview Challenge Implementation** | Developer: richofftechllc | March 2026

---

## User Story

**As a** Customer Service Clerk, **I want** to be prompted to automatically create a special handling note when I set the parent field on a Case, **so that** I can proactively communicate to anyone else reviewing the case.

---

## Acceptance Criteria — All Met

| # | Requirement | Status |
|---|-------------|--------|
| 1 | New scoped application "STS Customer Service" | Done — Scope: x_snc_sts_custsvc |
| 2 | When parent field changes, prompt user for free-form text | Done — Client Script onChange fires a prompt() dialog |
| 3 | Auto-create Special Handling Note with Priority = Moderate | Done — Script Include creates note with priority 2 (Moderate) |
| 4 | Note displays as popup if case active OR within 7 days of creation | Done — display_type=popup, expiry_date = today + 7 days |
| 5 | Logic is reusable from any field, including configurable days | Done — STSSpecialHandlingUtils accepts any field, text, priority, daysValid |

---

## Architecture

```
STS Customer Service (Scoped App: x_snc_sts_custsvc)
|
+-- Script Include: STSSpecialHandlingUtils
|   +-- createSpecialHandlingNote(caseId, noteText, priority, daysValid)
|   +-- ajaxCreateNote()  [GlideAjax entry point from Client Scripts]
|
+-- Client Script: STS - Create Special Handling Note on Parent Change
    +-- Table:  sn_customerservice_case
    +-- Type:   onChange
    +-- Field:  parent
    +-- Calls:  STSSpecialHandlingUtils.ajaxCreateNote via GlideAjax
```

---

## Files

| File | Description |
|------|-------------|
| script-include/STSSpecialHandlingUtils.js | Reusable server-side utility |
| client-script/STS-ParentChange-SpecialHandlingNote.js | Client Script - onChange parent field |
| README.md | Documentation |

---

## Script Include: STSSpecialHandlingUtils

**API Name:** x_snc_sts_custsvc.STSSpecialHandlingUtils
**Client Callable:** Yes | **Accessible From:** All application scopes

### Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| caseId | String | required | sys_id of the Case |
| noteText | String | required | Free-form text from user |
| priority | String | '2' | 1=Critical, 2=Moderate, 3=Low |
| daysValid | Number | 7 | Days until expiry |

---

## Edge Cases & Bugs Handled

| Issue | Solution |
|-------|---------|
| onChange fires on form load | if (isLoading) return |
| User cancels prompt | if (noteText === null) return |
| User submits empty text | if (noteText.trim() === '') return |
| Parent field cleared | if (newValue === '') return |
| Cross-scope access | Set to All application scopes + client callable |

---

## Jira Story Breakdown

```
Epic: STS Customer Service Enhancements

Story: CS-001 — Special Handling Note on Parent Field Change
  Task CS-001-1: Create Scoped Application (x_snc_sts_custsvc)
  Task CS-001-2: Create STSSpecialHandlingUtils Script Include
  Task CS-001-3: Create Client Script (onChange: parent field)
  Task CS-001-4: Verify popup behavior on active cases (7 day expiry)
  Task CS-001-5: Documentation and GitHub push
```

---

## ServiceNow Object Reference

| Object | Table | Identifier |
|--------|-------|------------|
| Scoped App | sys_app | sys_id: 90716a281b37be105a619601b24bcbc3 |
| Script Include | sys_script_include | STSSpecialHandlingUtils |
| Client Script | sys_script_client | STS - Create Special Handling Note on Parent Change |
| Scope | sys_scope | x_snc_sts_custsvc |

---

*Built for STS interview challenge. All code follows ServiceNow best practices.*
