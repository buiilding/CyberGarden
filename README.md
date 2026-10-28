# CyberGarden — garden and editor

A quiet personal garden with a separate document editor. With cloud storage configured, page titles and Markdown live in Supabase Postgres, images in Cloudflare R2, and videos in YouTube. Without DATABASE_URL, the local prototype keeps pages in browser IndexedDB. Owner-only Google sign-in uses Supabase Auth and an exact email allowlist. The Python handler runs locally or on Vercel; there is no analytics or remote font.

## Try it

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
npm ci
npm run build
npm start
```

Open **http://localhost:4183** (the default `APP_ORIGIN`). The public garden works without auth configuration. Open `/editor` directly to edit; without a validated owner session it opens Google sign-in. Missing configuration keeps the editor locked and shows setup instructions. Clean routes work on direct visits and refreshes; older hash bookmarks still resolve to clean paths.

## Configure Google editor sign-in

The local code is implemented; you must supply a Supabase project and your own Google OAuth configuration. No external project, account, or credentials are created by this repository.

1. Copy `.env.example` to `.env.local`. Set `SUPABASE_URL` to your HTTPS Supabase project URL, `SUPABASE_PUBLISHABLE_KEY` to its **publishable** key (`sb_publishable_...`), and `OWNER_EMAIL_ALLOWLIST` to your exact Google account email. Email matching ignores case; it does not accept wildcards. Do not use a Supabase secret/service-role key. `.env.local` is Git-ignored and cannot be fetched from the local server.
2. Keep `APP_ORIGIN` at the **same hostname and port you used for your existing pages**. Default: `http://localhost:4183`. If you used `http://127.0.0.1:4183`, set that instead. Browser storage is origin-specific; switching between these addresses does not move your pages. The server accepts only the configured Host and remains bound to loopback.
3. In Google Cloud / Google Auth Platform, configure the consent screen and create a **Web application** OAuth client. For an external app in Testing mode, add your owner account as a test user. Request only `openid`, email, and profile. Add your `APP_ORIGIN` as an authorized JavaScript origin. Set the authorized redirect URI to the **Supabase Google provider callback** shown in the Supabase dashboard (normally `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`). This Google redirect is different from the local callback below.
4. In Supabase **Authentication → Sign In / Providers → Google**, enable Google and enter that Google Client ID and Client Secret. Keep the Google secret in Supabase's provider settings, never in browser code or this repository. Disable unused email/phone/anonymous providers for this owner-only app. Do not enable YouTube or request YouTube scopes.
5. In Supabase **Authentication → URL Configuration**, set Site URL to your `APP_ORIGIN` and add its exact callback to Redirect URLs: `http://localhost:4183/auth/callback` (or `http://127.0.0.1:4183/auth/callback` if that is your configured origin).
6. Restart `npm start`, open `/editor`, and choose **Continue with Google**. The server checks the verified Google identity and owner email before returning the editor. **Sign out** ends the local editor session without clearing pages or media.

Official setup references: [Supabase Google sign-in](https://supabase.com/docs/guides/auth/social-sign-in/auth-google), [PKCE flow](https://supabase.com/docs/guides/auth/sessions/pkce-flow), and [redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls).

The server uses the Supabase Auth HTTP API directly, without a Supabase SDK or service-role key. Cloud page storage additionally needs the private Postgres schema described below. Use Python 3.12+ and install requirements.txt:

```sh
cp .env.example .env.local
# Fill the values in .env.local, then:
npm start
```

Environment variables already set in your shell override `.env.local`. Values are literal `KEY=value`; no shell commands, interpolation, or inline comments are evaluated.

## Authentication boundary

`/editor` and every editor page require server validation against Supabase's `/auth/v1/user`, including after refresh-token rotation, plus the owner email allowlist and a verified Google identity. Public HTML contains no editor controls; `editor.html` is a server-only template. Moving between garden and editor makes a full document request. The editor also checks `/auth/session` on entry, window focus, returning from browser history, and every minute while visible; a failed check locks it and returns to sign-in.

In local-only mode, PKCE verifiers and Supabase access/refresh tokens stay in server memory. In cloud mode, session and OAuth state are encrypted with SESSION_ENCRYPTION_KEY in the private cybergarden.runtime table. A database transaction lock coordinates token refresh and single-use callbacks across Vercel instances. The browser receives only a random, host-only, HttpOnly, SameSite=Lax session cookie. Login and logout forms require a same-origin POST and a CSRF token. Cookies use Secure on hosted HTTPS. Local HTTP development remains bound to loopback. Sessions expire after eight hours; cloud sessions survive function restarts. Logout invalidates local access immediately and attempts Supabase logout for this session only. Supabase's upstream access-token revocation behavior still applies to tokens issued elsewhere.

This protects the editor delivered by the server. Garden page content is public. Browser backups are not encrypted against someone with access to this browser profile. In cloud mode, public views read saved Markdown from the server; only validated owner sessions with same-origin CSRF protection can write it. Keep portable exports.

## Use the editor

- Click into the page title or body and type. Use the toolbar for headings and bold. No Markdown or HTML typing is needed.
- In the body of Home or any page, type `!` at the start of a line or after a space to find a page. Keep typing to search its title, including multiple words; use Up/Down and Enter, or click a result. The title becomes an underlined link and writing continues after it. Escape keeps your literal `!query`. Links export as ordinary Markdown, such as `[A small note](/page/note)`, with stable page IDs; Home links to `/`.
- **Home** is fixed at the top of the editor sidebar and opens at `/editor/home` (also the default at `/editor`). Edit its title and body with the same text and media controls, then use **Save ↗** to open the homepage at `/`. Home is stored separately from ordinary pages and does not appear in All Pages.
- Right-click inside the page body for **Add image** and **Upload video** at that position. Press Escape or click outside to dismiss the menu.
- Paste an image from your clipboard at the text cursor, or choose **Add image**. Supported images: PNG, JPEG, GIF, WebP, AVIF.
- Hover over an image or video to show its trash icon at the top right. Click it to remove that media item, or select the item and press Backspace or Delete. The icon also appears when the media has keyboard focus.
- If the page ends with media, the editor keeps a typing line beneath it. With a media block selected, Enter or Arrow Down moves into text below; Arrow Up moves into text above, creating a paragraph only when needed. Clicking the blank area below the content also places the cursor at the end. Empty helper paragraphs stay out of exported Markdown; text you type into them is kept.
- Choose **Upload video** to upload a local video to your connected YouTube channel and insert it after processing. See the setup instructions below.
- Paste a YouTube URL on its own. It becomes a playable YouTube embed in the editor and garden. The player uses youtube-nocookie.com and requires internet access. The IFrame Player API calls `mute()` when the player is ready, with autoplay off; viewers can unmute normally. Existing-link previews need no API key or account connection. Some videos disallow embedding and cannot play inside the page.
- Choose **+ New page**, or **Import Markdown…** on an ordinary page to create a page from a `.md` file or a garden ZIP. When Home is selected, **Import Home Markdown…** replaces Home's content instead. An initial `# Heading` becomes the separate title; the remaining Markdown is the body. Both export controls work for Home, too.
- Use **Save ↗** to open the saved page in the garden. They also appear under **All Pages**.
- **Delete** removes an ordinary page from the editor and garden, including after a reload. Deleting the last ordinary page returns to Home. Home is fixed and has no Delete control; its content can be cleared or changed. Starter pages do not return automatically.

## Local storage and content

`content/entries.json` holds starter records with separate `title` and `markdown` fields. It is loaded only when this browser has no saved entries. `content/home.json` supplies Home on first use; an existing garden receives this Home record without replacing any of its pages. Home uses the reserved storage ID `__garden_home__`. Editing does not change the source files. Browser edits and selected media are saved to IndexedDB (`cybergarden-local-v1`) on this exact origin, including its port. Use the same preview URL and browser to return to them. Browser storage can be cleared or evicted; exports are the portable copy. Without DATABASE_URL, this mode does not sync tabs or devices. Cloud mode uses Supabase as page authority, with revision checks that reject stale writes from another tab or device. Failed saves retain browser draft copies and an export option.

The rich editor converts its document to Markdown on each change. The public garden renders that Markdown. Supported content includes headings, paragraphs, emphasis, links, lists, images, and video references. Raw HTML is displayed as text; rich clipboard HTML is pasted as plain text. Image URLs from the configured R2 image origin render normally. Other remote image references show placeholders.

## Take a page out and bring it back

**Export .md** downloads a UTF-8 text file, with the title as the first `#` heading:

```md
# A page title

A paragraph and [a link](https://example.com).

## A section

![A description](assets/unique-id-picture.png)

[Video: a local clip](assets/unique-id-clip.mp4)

https://www.youtube.com/watch?v=jfKfPfyJRdk
```

Image references are standard Markdown images. Local video references are ordinary Markdown links prefixed with `Video:`; the garden recognizes them as a video. A YouTube reference is a plain URL on a separate line. There is no proprietary embed HTML in the exported text.

A `.md` file contains references, not binary media. **Export with media (.zip)** includes the Markdown plus referenced local media in `assets/` and a small explanatory README. Import the ZIP here to restore the page with its media, or unpack it to use the Markdown elsewhere. Import creates a new ordinary page, or replaces Home when Home is selected. Importing a `.md` without its local media retains the reference and shows a missing-file placeholder. External references remain references and are not downloaded. Video links may appear as links in other Markdown readers; that is intentional portability.

## Source and rebuild

- `index.html`, `style.css`: public garden layout and shared styling.
- `editor.html`: editor template, returned only inside an authenticated editor document.
- `src/app.js`: editing, Markdown conversion, routing, local storage, and import/export.
- `src/routes.js`: clean paths and compatibility with older hash links.
- `server.py`, `auth.py`: local route protection, server-side OAuth PKCE exchange, session validation/refresh, and restricted static serving.
- `src/editor-auth.js`: same-origin session checks; contains no Supabase credentials or tokens.
- `script.js`: checked-in browser bundle. Rebuild this file after changing src/. Install Python requirements for cloud storage and R2 signing.
- `content/entries.json`: starter content, separate from the website source.
- `content/home.json`: starter title and Markdown for the editable homepage.
- `sample.svg`: original geometric placeholder.

To change application behavior, install the locked development dependencies and rebuild the bundle:

```sh
npm ci
npm run build
```

Run the local checks:

```sh
.venv/bin/python -m unittest discover -s tests -p 'test_*.py'
node --test tests/*.test.mjs
npm run build
node --check script.js
```

Auth integration tests run real loopback HTTP requests against an isolated Supabase/Google protocol fixture: PKCE, owner rejection, session validation/refresh, logout, CSRF, expiry, private-file access, and the referrer policies required for native login/logout forms. There is no bypass switch in the app and automated tests do not use real accounts or change real services. DOM tests cover public rendering, editor authorization and local saves, plus page-picker logic with simulated selection and geometry. In this checkout, Google consent, owner editor access, sign-out, and rejection of a signed-out direct editor visit were also verified in Chrome using the configured account. Browser verification did not change page text. A fresh checkout still needs the configuration above; real credentials remain outside Git.

The bundle contains marked, Turndown, DOMPurify, and fflate. Application dependencies are bundled locally; YouTube players load from YouTube when a video is shown. Keep the server bound to `127.0.0.1` for local review.

## Upload a local video to YouTube

In the editor, place the cursor, right-click, and choose **Upload video**. Selecting a local video inserts a preview and starts uploading immediately. Defaults are the filename as the title, an empty description, Unlisted visibility, and not made for kids. There is no details form or second upload click. A small overlay shows uploading/processing status and Retry on failure. Keep writing: the preview becomes the YouTube player when processing succeeds. If YouTube is disconnected, the overlay asks you to connect; uploading starts automatically after connecting.

One-time local setup (separate from the Supabase editor login):

1. Enable **YouTube Data API v3** in your Google Cloud project. Configure the OAuth consent screen; add your Google account as a test user while the app is in Testing.
2. Create a Google **Web application** OAuth client. Add the exact redirect URI `http://localhost:4183/youtube/callback` (or the configured `http://127.0.0.1:4183/youtube/callback`). This is separate from Supabase's callback. Add your APP_ORIGIN as an authorized JavaScript origin.
3. Set `YOUTUBE_CLIENT_ID` and `YOUTUBE_CLIENT_SECRET` in your ignored `.env.local`, then restart `npm start`. The server never serves this file. Do not paste credentials into the editor.
4. On the upload card, **Connect YouTube** and grant upload plus read access. Read access is used to identify the channel and wait for video processing. Google API discovery lists `youtube.readonly` for `videos.list`; the upload-only scope is insufficient for the whole flow.

Uploads use 8 MiB file slices sent directly from the browser to Google's resumable endpoint. Uploading and processing run while you edit or switch pages inside the editor. Errors show **Retry** on the card. Removing the block stops its upload/check without deleting anything already uploaded to YouTube. While file bytes are uploading, keep this tab open; closing or reloading warns you and loses the in-memory file and upload session. After a reload, the interrupted card can ask for the original file again. Once YouTube has returned a video ID, it is saved with the placeholder: returning to the editor resumes processing checks without reuploading the file. Pending cards and their metadata stay in this browser; exports retain a pending reference until completion.

Without cloud storage, YouTube authorization lives in the local server session. In cloud mode, the owner's YouTube connection is encrypted in Supabase and can be reused after a new editor sign-in; Disconnect removes the saved connection. A short-lived YouTube access token enters browser memory for the direct upload; neither token nor the resumable session URI is saved in IndexedDB, exports, or logs. Refresh-token expiration or revocation may require reconnecting. Google External Testing refresh tokens expire after seven days. File transfer runs in the browser, so keep the tab open while uploading. Processing checks resume when the editor is reopened; there is no background worker.

The uploader accepts files up to 256 GB; YouTube also limits duration to 12 hours and requires channel verification for uploads longer than 15 minutes. Processing success does not override YouTube's copyright, age, regional, or embedding restrictions. The server supplies the normal cross-origin Referer needed by embedded players.

References: [resumable upload protocol](https://developers.google.com/youtube/data/guides/using_resumable_upload_protocol), [OAuth web-server flow](https://developers.google.com/identity/protocols/oauth2/web-server), [YouTube API discovery](https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest), [upload UI requirements](https://developers.google.com/youtube/terms/required-minimum-functionality), [upload limits](https://support.google.com/youtube/answer/71673).

Focused checks: `.venv/bin/python -m unittest discover -s tests -p 'test_*.py'` and `node --test tests/youtube-upload.test.mjs`. These use provider fixtures; a real Google connection and upload require the configuration above.

## Cloudflare R2 images

**Add image** and clipboard image paste insert a local preview immediately and automatically upload the image to R2. A small status overlay shows upload activity and **Retry** on failure. The resulting page stores a permanent public HTTPS image URL in ordinary Markdown. Removing an image block stops an in-flight upload; it removes the page reference and does not delete an object already stored in R2. Existing local images are preserved; they are not migrated automatically.

Setup:

1. Activate R2 in your Cloudflare account. It includes a free allowance with usage-based charges above it.
2. Create the **cybergarden-images** bucket with Standard storage.
3. Create an **Object Read & Write** R2 S3 credential restricted to this bucket. Put `R2_ACCOUNT_ID`, `R2_BUCKET_NAME`, `R2_ACCESS_KEY_ID`, and `R2_SECRET_ACCESS_KEY` in ignored `.env.local`. Keep the secret out of frontend code.
4. Set `R2_PUBLIC_BASE_URL` to the HTTPS image domain. For local review you can enable the bucket's Public Development URL (`https://pub-....r2.dev`); Cloudflare rate-limits this endpoint and recommends a custom domain for production. Bucket objects must be intentionally public for garden visitors to view them.
5. Add the following bucket CORS policy (also saved in `config/r2-cors.json`). Use your exact APP_ORIGIN; when deploying, add the deployed editor origin too.

```json
[
  {
    "AllowedOrigins": ["http://localhost:4183"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Install `requirements.txt`, then restart `npm start`. The Python server uses boto3 to create five-minute presigned PUT URLs, signed for a random image key, MIME type, and exact content length. The browser uploads bytes directly to R2. Only an owner session with a valid same-origin CSRF token can request an upload URL. Public `/media/config` returns only the image origin, configured status, and upload limit. No R2 credential is sent to the browser or written to logs.

PNG, JPEG, GIF, WebP, and AVIF images are accepted up to 40 MB each. A local IndexedDB copy remains as a recovery backup; the saved page points to R2 once the upload succeeds. Pending image uploads can retry from that backup after reopening the editor. R2 image URLs remain external references in Markdown/ZIP exports; they are not downloaded into exported ZIPs. Switching image domains later requires updating saved image URLs or preserving the old image origin.

R2 stores image bytes. Supabase page Markdown stores their public URLs in cloud mode.

Official references: [R2 presigned uploads](https://developers.cloudflare.com/r2/api/s3/presigned-urls/), [R2 CORS](https://developers.cloudflare.com/r2/buckets/cors/), [public image delivery](https://developers.cloudflare.com/r2/buckets/public-buckets/).


## Supabase pages and Vercel deployment

1. From Supabase **Connect → Transaction pooler**, save the complete Postgres URI as DATABASE_URL. Replace the password placeholder with the URL-encoded database password. Keep it server-only. This uses SQL directly; the Data API is not required.
2. Generate SESSION_ENCRYPTION_KEY once using `.venv/bin/python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"`. Save it in ignored .env.local and preserve it across deployments; replacing it invalidates saved OAuth state and connections.
3. Run `.venv/bin/python scripts/init-cloud.py`. It creates the private cybergarden schema with page documents and encrypted session state. Anonymous and authenticated Data API roles have no access to these tables. The server's database credential can access them; it must never enter frontend code or logs.
4. Configure Vercel Preview environment variables using .env.example as the checklist. APP_ORIGIN must be the exact stable HTTPS alias. Upload secrets as sensitive server variables. This checkout uses `https://peterbuics.com`. Keep local APP_ORIGIN at localhost for migration.
5. In Supabase **Authentication → URL Configuration → Redirect URLs**, add `https://peterbuics.com/auth/callback`. Keep the localhost callback too. Set Site URL to the deployed origin when making it the primary site.
6. In the Google Web OAuth client used for YouTube, add `https://peterbuics.com/youtube/callback` to authorized redirect URIs. Add the deployed origin to authorized JavaScript origins. The Supabase provider's Google callback stays on the Supabase project domain.
7. Add the deployed origin to R2 CORS AllowedOrigins alongside localhost (config/r2-cors.json). Keep other existing origins/rules. The bucket's Object Read & Write upload credential cannot change bucket CORS; use the Cloudflare dashboard or an appropriate admin credential.
8. Run `vercel deploy --yes --target=preview` for a preview, then assign the stable alias with `vercel alias set DEPLOYMENT_URL peterbuics.com`. The server accepts only APP_ORIGIN, so use that alias. Keep Vercel Authentication disabled for the public garden; the application itself protects /editor.

Vercel serves the Python BaseHTTPRequestHandler in api/index.py; all public/editor routes pass through its allowlist. .env files, dependencies, tests, and local caches are excluded from the function upload. Image and video bytes travel directly from the browser to R2/Google, bypassing Vercel request-size and duration limits. The server only handles metadata, OAuth, and short processing checks. R2 signing uses boto3, so it needs no Node subprocess in the Python function.

**Move this browser's existing garden:** after DATABASE_URL is configured, restart the local server and open the original localhost editor in the same browser profile that has your pages. Click **Upload this browser’s garden to Supabase** before creating cloud pages. It uploads referenced local images to R2, replaces their URLs, and imports the page records atomically only into an empty cloud garden. Finish pending YouTube uploads first. This step needs the original browser's IndexedDB; deploying source code does not upload those pages. Local records stay intact as a backup. New browsers read Supabase thereafter.

Cloud edits autosave with a 300 ms debounce. Revision conflicts stop further writes for that page until reload; export unsaved drafts before reloading. Page deletion saves a tombstone. Deleting image/video references does not delete remote provider objects. Page payloads are limited to 1 MiB of Markdown each, and browser garden imports to 500 pages and the server's 3 MiB encoded request limit.

Official references: [Vercel Python runtime](https://vercel.com/docs/functions/runtimes/python), [Supabase transaction pooler](https://supabase.com/docs/guides/database/connecting-to-postgres), and [Supabase redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls).


### Custom domain: peterbuics.com

The domain is attached to the Vercel project. Spaceship hosts its DNS; the root A record is `@ → 76.76.21.21`. Vercel reports the DNS configuration valid. The hosted APP_ORIGIN is `https://peterbuics.com`, while .env.local stays on localhost for local review and browser data migration. Preview-target deployments are explicitly assigned to the custom domain with `vercel alias set DEPLOYMENT_URL peterbuics.com`.

Automatic Git deployments from main are disabled in vercel.json. The current site uses a manually assigned Preview deployment and Preview environment variables; production variables are not configured. Pushing code updates the repository without replacing that deployment. Deploy manually using the commands above, or configure the Production environment before enabling automatic deployments from main.

Required provider settings:

- Supabase Redirect URL: `https://peterbuics.com/auth/callback`; keep localhost allowed too.
- Google YouTube OAuth redirect URI: `https://peterbuics.com/youtube/callback`; JavaScript origin: `https://peterbuics.com`.
- R2 CORS AllowedOrigins: add `https://peterbuics.com`, keeping localhost and other existing origins.

Only the exact APP_ORIGIN serves application requests. Provider settings and the original-browser migration require separate completion. Browser-based acceptance testing is left to the owner.
