# Site Commenter distribution

Public production bundles for reusable website annotations. The source repository is private. This repository has no site-specific adapter, Google backend code, Sheet ID, credentials, source map or unminified plugin source.

## Use on an ordinary website

```html
<script defer
  src="https://symph-antonio.github.io/site-commenter-dist/v1.6.0/site-commenter.min.js"
  crossorigin="anonymous"
  integrity="sha384-LCLtKkU7l2bnuWDumPTrvSfCdDskSo9cbI50mB2caUaX7qjOZhPI5k353SJT4As1"
  data-site-id="your-site"
  data-revision="page-v1"
  data-endpoint="YOUR_PUBLIC_APPS_SCRIPT_EXEC_URL"></script>
```

Use the exact `files["site-commenter.min.js"].integrity` value in the version's [manifest](https://symph-antonio.github.io/site-commenter-dist/v1.6.0/manifest.json). Configure your site's allowed ID and public endpoint separately. The bundle includes its own startup, ordinary DOM adapter and snapshot renderer. No package installation or per-site bundling is required. The comments backend must already be deployed.

Custom adapters belong to the consuming site. Load the generic bundle with `data-auto-init="false"`, register the adapter in a following `defer` script, then call `SiteCommenter.init(config)` from that script. Do not select a named adapter before registering it. `SiteCommenter.ready`, `.instance` and `.error` expose startup state.

## Publish a new version

From the private source checkout, bump the package version for changed production bytes, then run:

```sh
npm run build:production
npm run test:hosting
node export-pages.mjs /absolute/path/to/site-commenter-dist
```

In this distribution checkout, run `node verify.mjs`, inspect the diff, commit the new version directory and catalog with a Conventional Commit, then push `main`. GitHub Actions verifies and deploys only `public/` to Pages. Existing version directories are retained and may not be overwritten. No cross-repository token or build credential is needed; exporting and pushing a new release is an explicit maintainer action.

Consumers upgrade by changing their pinned version URL and integrity hash. There is no mutable `latest` URL. Source maps are deliberately excluded from public hosting. Notices for the bundled renderer ship beside each release.

Version 1.5.1 shows every non-archived thread and colors pins by Sheet status. Open is blue, For review amber, In progress purple, Resolved green, and other/blank statuses neutral. The list defaults to all non-archived threads; list filters leave pins visible. Archived roots/replies are hidden after refresh or polling. Backend redeployment is not required.

Version 1.6.0 adds Archive in thread popups, including threads opened from the all-comment list. It hides threads and replies without deleting their Sheet records. Deploy the updated private Apps Script backend as a New version of the existing deployment to enable the action; the frontend disables it until `capabilities.archive` is advertised.
