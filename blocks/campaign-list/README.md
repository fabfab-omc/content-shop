# campaign-list

Lists the published campaign pages (folder index pages, `/campaigns/{name}/`) automatically, most recently updated first, as campaign cards (same design as **cards-campaigns**).

## Authoring (Document Authoring)

Block table "Campaign list" with optional key/value rows:

| Campaign list |              |
| ------------- | ------------ |
| Limit         | 3            |
| Show          | current      |

- **Limit**: number of cards, empty = all.
- **Show**: `current` (default), `archived` or `all`. With `archived` and no archived campaigns, the whole section (including its heading) is hidden.

## Data per campaign (query index)

- Title: the page's main heading (h1).
- Image: the page's first image, or the **Image** page metadata if set.
- Archived: **Archived** page metadata (`yes`); empty or `no` = current.

A campaign appears once its page is published.
