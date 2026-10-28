# CyberGarden — local garden and editor

A quiet personal garden with a separate document editor. Pages and media remain in the browser's local IndexedDB. The loopback Python server protects editor access using Supabase Auth, Google sign-in, and an exact owner email allowlist. There is no content backend, publishing, analytics, or remote font. YouTube embeds also support uploading a local video to your channel through a separate Google OAuth connection.

## Try it

```sh
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

The local server uses the Supabase Auth HTTP API directly, so no Supabase SDK, database schema, storage bucket, migration, or service-role credential is needed. Start with Python 3.10+ and the checked-in browser bundle:

```sh
cp .env.example .env.local
# Fill the values in .env.local, then:
npm start
```

Environment variables already set in your shell override `.env.local`. Values are literal `KEY=value`; no shell commands, interpolation, or inline comments are evaluated.

## Authentication boundary

`/editor` and every editor page require server validation against Supabase's `/auth/v1/user`, including after refresh-token rotation, plus the owner email allowlist and a verified Google identity. Public HTML contains no editor controls; `editor.html` is a server-only template. Moving between garden and editor makes a full document request. The editor also checks `/auth/session` on entry, window focus, returning from browser history, and every minute while visible; a failed check locks it and returns to sign-in.

PKCE verifiers and Supabase access/refresh tokens stay in server memory. The browser receives only a random, host-only, HttpOnly, SameSite=Lax session cookie. Login and logout forms require a same-origin POST and a CSRF token. The cookie intentionally uses local HTTP without `Secure`; this server is restricted to loopback HTTP and is not a production deployment. Sessions expire after eight hours or a server restart. Logout invalidates local access immediately and attempts Supabase logout for this session only. Supabase's upstream access-token revocation behavior still applies to tokens issued elsewhere.

This protects the editor delivered by the server. As requested, content is still local and public garden views can read it. Auth does not encrypt IndexedDB or protect it from someone with access to this browser profile or its developer tools. No page content or media is sent to Supabase. Keep using the same browser and origin, and keep portable exports.

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

`content/entries.json` holds starter records with separate `title` and `markdown` fields. It is loaded only when this browser has no saved entries. `content/home.json` supplies Home on first use; an existing garden receives this Home record without replacing any of its pages. Home uses the reserved storage ID `__garden_home__`. Editing does not change the source files. Browser edits and selected media are saved to IndexedDB (`cybergarden-local-v1`) on this exact origin, including its port. Use the same preview URL and browser to return to them. Browser storage can be cleared or evicted; exports are the portable copy. This prototype does not sync tabs or devices.

The rich editor converts its document to Markdown on each change. The public garden renders that Markdown. Supported content includes headings, paragraphs, emphasis, links, lists, images, and video references. Raw HTML is displayed as text; rich clipboard HTML is pasted as plain text. Remote image references show placeholders to keep the prototype local.

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
- `script.js`: checked-in browser bundle. The local server can run without installing dependencies.
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
python3 -m unittest discover -s tests -p 'test_*.py'
node --test tests/*.test.mjs
npm run build
node --check script.js
```

Auth integration tests run real loopback HTTP requests against an isolated Supabase/Google protocol fixture: PKCE, owner rejection, session validation/refresh, logout, CSRF, expiry, private-file access, and the referrer policies required for native login/logout forms. There is no bypass switch in the app and automated tests do not use real accounts or change real services. DOM tests cover public rendering, editor authorization and local saves, plus page-picker logic with simulated selection and geometry. In this checkout, Google consent, owner editor access, sign-out, and rejection of a signed-out direct editor visit were also verified in Chrome using the configured account. Browser verification did not change page text. A fresh checkout still needs the configuration above; real credentials remain outside Git.

The bundle contains marked, Turndown, DOMPurify, and fflate. Application dependencies are bundled locally; YouTube players load from YouTube when a video is shown. Keep the server bound to `127.0.0.1` for local review.

## Upload a local video to YouTube

In the editor, place the cursor, right-click, and choose **Upload video**. Choose a local video. The dialog prefills its title from the filename, allows an optional description, defaults to **Unlisted**, and offers Public or Private plus the made-for-kids setting. Connect YouTube, check the displayed channel, then choose **Upload and insert**. Public and Unlisted allow visitors to watch; Private generally does not.

One-time local setup (separate from the Supabase editor login):

1. Enable **YouTube Data API v3** in your Google Cloud project. Configure the OAuth consent screen; add your Google account as a test user while the app is in Testing.
2. Create a Google **Web application** OAuth client. Add the exact redirect URI `http://localhost:4183/youtube/callback` (or the configured `http://127.0.0.1:4183/youtube/callback`). This is separate from Supabase's callback. Add your APP_ORIGIN as an authorized JavaScript origin.
3. Set `YOUTUBE_CLIENT_ID` and `YOUTUBE_CLIENT_SECRET` in your ignored `.env.local`, then restart `npm start`. The server never serves this file. Do not paste credentials into the editor.
4. In the upload dialog, **Connect YouTube** and grant upload plus read access. Read access is used to identify the channel and wait for video processing. Google API discovery lists `youtube.readonly` for `videos.list`; the upload-only scope is insufficient for the whole flow.

Uploads use 8 MiB file slices sent directly from the browser to Google's resumable endpoint. Upload progress and YouTube processing are separate stages. Retry resumes an interrupted upload or checks the already uploaded video; it does not intentionally upload a second copy. Keep the dialog/tab open. A reload loses the local upload job. Cancel stops sending bytes or waiting; it does not delete a video already uploaded to the channel. Inserting the completed video uses the original page and cursor, then saves an ordinary YouTube URL in Markdown. If that position is no longer valid, the dialog shows the video link instead.

YouTube authorization state and refresh tokens live only in the local server's owner session, disappearing on logout/session expiration or server restart. A short-lived YouTube access token enters browser memory for the direct upload; neither token nor the resumable session URI is saved in IndexedDB, exports, or logs. Refresh-token expiration or revocation may require reconnecting. Google External Testing refresh tokens expire after seven days. This loopback implementation does not provide production token storage, background uploads, or a Vercel/Supabase content migration.

The uploader accepts files up to 256 GB; YouTube also limits duration to 12 hours and requires channel verification for uploads longer than 15 minutes. Processing success does not override YouTube's copyright, age, regional, or embedding restrictions. The server supplies the normal cross-origin Referer needed by embedded players.

References: [resumable upload protocol](https://developers.google.com/youtube/data/guides/using_resumable_upload_protocol), [OAuth web-server flow](https://developers.google.com/identity/protocols/oauth2/web-server), [YouTube API discovery](https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest), [upload UI requirements](https://developers.google.com/youtube/terms/required-minimum-functionality), [upload limits](https://support.google.com/youtube/answer/71673).

Focused checks: `python3 -m unittest discover -s tests -p 'test_*.py'` and `node --test tests/youtube-upload.test.mjs`. These use provider fixtures; a real Google connection and upload require the configuration above.
