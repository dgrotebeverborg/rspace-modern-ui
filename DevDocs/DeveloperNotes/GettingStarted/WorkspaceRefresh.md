# Compare the Workspace refresh with vanilla RSpace

This first iteration refreshes the Workspace presentation. It is not a replacement
of the entire application UI. The shared page header and login screen use the same updated visual language.
The structured-document editor now has matching scoped presentation styles;
Inventory and other screen bodies retain their existing UI. Workspace retains its existing server rendering, permissions,
action handlers, search/filter semantics, sorting and pagination.

## Local checkouts

| Variant | Directory | Branch | Allocated app URL |
| --- | --- | --- | --- |
| Vanilla | `/path/to/rspace/rspace-web` | `main` | `http://localhost:8143` |
| Modern | `/path/to/rspace/rspace-modern` | `feat/workspace-refresh` | `http://localhost:8244` |

Both started at commit `d73524d6457b62798c1944890260d61a4eebbc16`.
The original checkout has no tracked modifications. Ports above are local values
in each checkout's ignored `docker/dev/.env`; the launcher prints current values.

Run in a terminal with Docker Engine access:

```bash
cd /path/to/rspace/rspace-web
./docker/dev/rspace-dev up

cd /path/to/rspace/rspace-modern
./docker/dev/rspace-dev up
```

Each first startup builds images, downloads dependencies, and initializes its own
database with sample data. Wait for Jetty startup in each instance:

```bash
./docker/dev/rspace-dev logs app
```

Open each URL and sign in with `user1a` / `user1234`. The launcher's separate
Compose project names, database/filestore volumes, ports and session cookie names
allow simultaneous use. Use the same account and recreate the same test records
in both versions when comparing. Changes to records are independent; databases
are deliberately not shared. Each stack needs about 6 GB available RAM.

Restart the Java application with `./docker/dev/rspace-dev restart`, **not**
`docker restart`: a container originally created in first-boot mode retains
`RSPACE_DB_MODE=drop-recreate-db`. The launcher recreates it with `keepdbintact`.
During this iteration a direct restart accidentally reset the modern sample DB;
the container has since been recreated in keep mode and persistence verified.
Vanilla was not restarted or modified.

Stop a stack without deleting data by running `./docker/dev/rspace-dev down`
from its checkout. Avoid `nuke`, `reset-db`, or `up --fresh` when preserving data.

## What changed

- Fluid Workspace page width, a page heading and a light surface palette.
- Wrapped toolbar, visible localized filter labels and accessible pressed states.
- Larger spacing, explicit keyboard focus, highlighted selected document rows.
- A keyboard-focusable horizontal scroll region keeps every table column on small
  screens. The table is still a table; no metadata or operations are removed.
- Workspace styles are scoped to `body.workspace-refresh`. The shared page header
  uses page-only MUI styles (dialog headers retain their existing styling). The
  login page uses `body.login-refresh`, with preserved form actions, conditional
  cloud login, recovery links, and visible translated field labels.
- Bare `/workspace` opens a home screen with four primary destinations: Notebooks,
  Documents, Files & media (Gallery), and Inventory when enabled for the user.
  Six recently updated accessible documents appear below; Favorites / Shared with
  me / Templates are secondary links, and the explanatory guide is collapsed.
  Recent items include permitted labgroup content, not personal “last opened” history.
- `?section=notebooks` and `?section=documents` open navigation collections backed
  by the existing user-scoped record service. They filter record types before
  sorting by modification time and paginating 12 records per page via `homePage`.
  Invalid/out-of-range page numbers clamp safely. These collections link into the
  existing editors; full record operations remain in All files.
- Collection routing only accepts the section/homePage query keys. Saved settings,
  folder links and existing search/filter parameters retain the file-browser route.
- `/workspace?view=files&currentViewMode=LIST_VIEW` opens the full file browser.
  Existing folder URLs, filters, pagination and `settingsKey` links keep their
  existing behavior. Home filter/search entrances explicitly select list mode.
- Home reuses the existing Create menu and dialogs. Creating a folder opens the
  visible parent or newly created folder according to the dialog checkbox.
- Authentication, storage, permission checks and record operations are unchanged.
  Home adds one read using the existing permission-aware filtered-record service.
  That service loads the accessible set before pagination; large-account
  performance has not been benchmarked.

## Verification before accepting this UI

Run the frontend checks from the modern repository root after installing the
pinned Node/pnpm environment (`pnpm install --frozen-lockfile`):

```bash
pnpm tsc
pnpm lint
RSPACE_BASE_URL=http://localhost:8244 pnpm test-e2e src/__tests__/e2e/specs/workspace
```

The E2E runner's configured admin credentials must match the dev stack; consult
`src/main/webapp/ui/src/__tests__/e2e/README.md` for its environment setup.
Manually compare document creation, row selection and bulk actions, sharing,
rename, delete/restore, search and advanced search, sorting, pagination, tree view,
and restricted-user actions. Check at 390, 768 and 1440 pixels, keyboard-only
navigation, zoom, long names and translated labels.

Validation after Docker access became available:

- Both stacks start; login endpoints return HTTP 200.
- TypeScript and Biome checks pass; 16 existing AppBar unit tests pass.
- Two JSP decoration tests pass; the Workspace bootstrap script survives SiteMesh.
- Chromium desktop and iPhone 13 checks cover login, visible Workspace content,
  account menu and mobile navigation. At 390px neither page has page-level
  horizontal overflow; the document table scrolls within its own region.
- Screenshots were inspected for login and Workspace on desktop/mobile.
- A `WebSocket closed without opened.` browser warning occurs in both the vanilla
  and modern development builds; it is not introduced by these presentation changes.
- Google sign-in width fits the narrow form; end-to-end external Google authentication
  is not verified in this non-cloud development configuration.

Home iteration checks:

- Four focused Java tests pass (two home behavior tests and two JSP checks).
- TypeScript and Biome pass. Translation extraction/types complete; translation
  lint reports only three existing warnings in unrelated files.
- Chromium verifies login to Home, recent-document links, saved-listing returns,
  and Favorites / Shared / Templates after a persisted tree-view preference.
- Folder creation works with both “navigate after create” states. Basic document
  and notebook creation open their editors. Created folders survive safe restart.
- Responsive checks pass at 320, 390 and 768px; iPhone 13 emulation also checks
  navigation. Desktop/mobile screenshots inspected.
- Independent review identified the tree-mode and folder-navigation regressions;
  both were fixed and the targeted re-review found no further issues.
- Connected Playwright MCP and Chrome DevTools tools are unavailable; standalone
  Playwright Chromium was used. No Lighthouse or large-account benchmark run.

This is a focused smoke check, not complete functional equivalence certification.

## Structured-document editor

The authenticated structured-document JSP adds `.document-refresh` and loads
`editor-refresh.css` after the legacy styles. Screen-only rules make the shell
fluid, restyle command bars and TinyMCE chrome, enlarge the editable document
title, and retain the existing responsive tree controls. Rich-text view fields
scroll wide content locally. Public and notebook views do not receive this scope;
the shared viewport metadata now permits browser zoom. Printing keeps the legacy
styles. TinyMCE configuration, editing handlers and permissions are unchanged.

Verified in Docker Chromium: rename; save and view; reopen with persisted text;
cancel restoring the saved text; desktop tree collapse/expand; 320/390/768px
page widths; iPhone 13 tree controls. A temporary DOM fixture with a 1600px table
and image verifies local overflow in view mode without saving fixture content.
Desktop/mobile screenshots inspected. TypeScript, Biome and both JSP checks pass.
External science integrations and every field type have not been retested.
No backend restart or database changes were needed for this presentation update.

## Form builder

`form.jsp` now scopes its presentation with `.form-refresh`: the existing
permission-aware My RSpace links wrap as compact text navigation, the form name
is prominent, actions have consistent contrast, and field previews stack on
phones. Existing field handlers, ordering, publication and icon controls remain.
Dialog width fits small viewports; browser zoom is enabled.

Runtime checks also exposed a missing `blockUIContentTemplate` on POST-created
forms: Save and Close threw a Mustache error before issuing a request. The default
decorator now statically includes that constant template instead of dynamically
dispatching its HTML resource. POST-created forms and GET edit views contain one
template; Save and Close successfully redirects to the form list.

Verified String and Text field creation, rename, save/reopen, ordering dialog,
creating an actual document from the saved form, and 320/390/768px sizing.
Desktop/mobile screenshots reviewed; button contrast checked after legacy CSS
overrides. TypeScript, Biome and the two JSP tests pass. Other field types and
publishing integrations were not comprehensively retested. Vanilla remains clean.

Form dialogs also share the neutral/teal styling, focus indicators, full-width
inputs and clear action buttons. The field editor sizes to its contents and
refits after settings arrive asynchronously; long settings scroll internally.
On phones dialogs use viewport-fixed positioning, including after scrolling a
long form. Browser checks cover all seven field types at 1440/390/320px, field
save, cancel/reset, close, and editing at scrollY 894. Screenshots inspected;
TypeScript and Biome pass.

Home navigation refinement verification: six focused Java tests pass; TypeScript
and Biome pass, with only the existing unrelated translation-lint warnings.
Chromium verifies four destinations, opening notebooks, distinct document pages,
page clamping, secondary Favorites, the New menu, collapsed/expanded help, and
320/390/768px widths. iPhone and desktop screenshots inspected. The shared Create
menu accepts a home-only New label and matching accessible name. The safe launcher
restart used keepdbintact and retained the development records.

### My RSpace profile and groups

The shared admin menu now uses compact wrapping text navigation (scoped by
`data-myrspace-nav`), retaining permission-gated items and original links/forms.
Profile and LabGroup views use the shared neutral/teal styling, card sections and
responsive action layouts. Profile React tables/activity/app panels now use
available width instead of a fixed 690px; wide tables scroll locally.
Existing profile, membership, security and API-key handlers are unchanged.

Validation: browser checks at 1440px, 390px and 320px; profile edit/cancel,
group rename/cancel and activity expansion. TypeScript and Biome passed.
Other My RSpace destinations inherit the compact navigation; their page content
has not all been redesigned in this pass.

### Inventory

Inventory now starts with a full-width listing until a user selects an item.
Removed implicit first-result selection from the detail view, search navigation
and small-to-large viewport transition; direct item URLs still open details.
No-details state keeps the listing visible even if the last visible panel was right.
The main desktop split gives the list more room; picker-dialog proportions stay unchanged.

The record toolbar keeps Edit visible and moves other existing actions into its
menu, preserving each action's permission/disabled logic. Search filters and saved
searches have a disclosure, while applied filter chips remain visible. Inventory-only
CSS provides neutral panels, workspace typography, teal primary actions and mobile
spacing. Subsample quantity moved into Overview; preview image moved into Details.

Validation: TypeScript, Biome, 18 targeted unit tests (including the new no-details
layout regression); desktop/mobile browser flows cover list-first, filters, selection,
secondary actions, edit/cancel, navigation, back, resize, direct links and new-sample
form opening. i18n lint retains three unrelated baseline warnings.
Browser connector/DevTools were unavailable; standalone Chromium was used.
Absolute localhost:8244 image URLs required a test-only route proxy to localhost:8080
inside Docker; with this mapping full details load without the earlier Network Error.
No backend or stored inventory data was changed by this redesign.

### Gallery

The standalone Gallery now uses the workspace/Inventory colours, typography,
sidebar spacing and neutral content panel. Its file listing uses the full width
until a selection is made; the existing information panel appears on selection.
The optional MainPanel `listFirst` prop defaults to false, retaining embedded
picker layouts. Grid/tree/carousel, selection, preview, upload, drag/drop and
permission handlers are unchanged. Selection/drop borders retain component
state styling; the refresh does not override them. The mobile details sheet
has matching primary buttons.

Validation: TypeScript and Biome; 53 tests across Gallery routing, sidebar,
actions and information panel. Standalone Chromium checks cover folder navigation,
selection/multi-selection, image preview, menus, upload, search and 390px layout.
The upload check added a small `gallery-ui-check.png` in Images/Examples in the
modern development stack. Vanilla was not modified.

Gallery and Inventory sidebars now share `components/sidebar-refresh.css`:
200px expanded / 64px collapsed, matching text, icon spacing, selected/hover
states, separators and Create button. Existing route, permission and drawer
state logic remains in the respective components.
The Gallery page now observes viewport state so mobile/desktop drawer setters
stay current after resize. Its mobile drawer is recreated when switching modes
and a closed modal cannot intercept clicks. Browser checks compare computed
sidebar styles and exercise expand/collapse and mobile opening for both pages.
Gallery now matches Inventory's desktop entry state: expanded on a new visit,
with local collapse state rather than its previous persisted Gallery-only flag.
Its drawer cannot flex-shrink. Checked actual entry state without forced opening:
outer and visible widths are 200px in both apps at 1440px and 1024px viewports;
reload after collapsing restores the expanded desktop default.

My RSpace now uses a 200px left sidebar for its existing secondary navigation,
matching the Gallery/Inventory shell. The global app bar stays above it. The
sidebar retains role-gated links and the Create Form POST; at widths below 768px
it becomes a native expandable menu. Header offsets observe the actual React
app-bar host (mounted directly under body) and optional header banners.
Validation: TypeScript, Biome, JavaScript syntax and diff whitespace checks pass.
Standalone Chromium checked profile, PI group, form list, directory, Create Form
and mobile menu navigation; desktop sidebar starts at the app bar's 68px bottom,
with no horizontal overflow at 1440px or 390px. Browser MCP/DevTools connectors
were unavailable, so this is not full dual-tool browser verification.

### Consistency pass (2026-11-05)

`myrspace-content-refresh.css`, loaded by the existing admin fragment, brings
Directory, Manage Forms, Deleted Items, shared/published lists, audit filters and
results, import/export and their dialogs into the refreshed visual style. It
preserves existing links, submissions and permission gates. Tables scroll inside
their panels on mobile; import/export stacks vertically. Error-state colors are
not replaced by neutral information styles. Gallery's decorative border override
was removed so selected/drop-target borders remain visible.

Coverage: twelve main destinations at 1440px and 390px (Workspace home, profile,
groups, Directory, forms, trash, shared, published, audit, import/export, Gallery,
Inventory). All measured without document-level horizontal overflow; before this
pass Directory/forms/import overflowed by 129/50/122px at 390px. Ordinary user and
sysadmin profile/Directory/audit navigation also checked. Chromium flows cover
Directory switching, form selection/filter/sort, audit filter add/remove and report,
export dialog opening, Gallery selection, Inventory details/menu/edit/cancel/mobile,
profile/group edit-cancel and seven form field types at 1440/390/320px. The form
check adds uniquely named fields to the existing development test form.

TypeScript, Biome and 53 focused Gallery tests pass. Some existing unit-test mocks
log ExportDialog configuration warnings despite passing. Editor save/rename/view/
reopen/cancel and responsive assertions pass, but that broader smoke test reports
two `Fancytree assertion failed: only init supported` console errors during tree
reloads. This remains an unresolved editor issue; do not claim an entirely clean
end-to-end suite. No source changes to tree loading were made in this visual pass.
Browser MCP/DevTools remain unavailable; these are standalone Chromium checks,
not a full browser matrix or audit of all deployment-specific integrations.

### System refresh

The shared System topBar fragment now renders its existing permission-gated links
in a 200px sidebar, with the Gallery/Inventory colors, spacing and active state.
A native disclosure replaces it below 768px; System adds a mobile viewport meta
when missing. Header height tracks the actual asynchronous app-bar mount.
System-specific CSS covers users, groups, communities, account creation,
configuration/maintenance and dialogs, reusing scoped legacy content styles.
The users grid keeps readable minimum column widths and a wrapping toolbar that
can grow; the summary moves into normal flow on narrow screens. Account form
fields stack on phones. No settings, users or roles are changed by this work.

Sysadmin published-document management keeps the System sidebar and active global
tab; the server's existing publishedLinks_for_sysadmin_to_manage flag determines
that presentation. Ordinary published-document management stays in My RSpace.

Validation: six main System destinations at 1440/390px (initial 570px mobile
horizontal overflow reduced to zero). Chromium phone emulation also checks the
mobile menu, users filtering/selection/actions, read-only system settings,
account-form opening and layout, and published-management navigation. Nine users
component tests and eight page-branding tests pass, as do TypeScript/Biome.
Independent review confirmed existing permission and reauthentication handlers
remain; its viewport finding was fixed and verified using isMobile emulation.
Browser MCP/DevTools connectors are unavailable, so this is standalone Chromium
coverage. No destructive admin actions or account-creation submissions were run.

Create Account alignment follow-up: the existing AJAX form now uses equal-width
paired fields with labels above, a bounded 1080px content area, distinct bulk
registration action, aligned community/group selection and a consistent action
footer. PI/admin community choices size to their content. Existing conditional
SSO/LDAP fields, submitted names and role checks remain in place. Labels now
reference explicit input IDs; password instructions appear below the input.
Standalone Chromium checks all four account roles at desktop/phone widths,
asserting equal column widths/baselines, no horizontal overflow, visible password
help, password visibility toggle and native required validation. No accounts were
submitted. TypeScript, Biome and diff checks pass; independent review's password
markup finding was corrected and covered by the browser check.
