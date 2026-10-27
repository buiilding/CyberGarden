# CyberGarden — local garden and editor

A quiet personal garden with a separate document editor. Sample pages are neutral placeholders. The application and storage run locally, without a backend, authentication service, publishing, analytics, or remote fonts. YouTube previews load YouTube's embedded player and IFrame Player API for muting; they need no API key or account configuration.

## Try it

```sh
npm start
```

Open **http://127.0.0.1:4183**. Use **Open local editor** in the sidebar. This control opens a mock editor directly; it is not real authentication. The editor is also at http://127.0.0.1:4183/editor. Clean routes such as `/pages`, `/editor`, and `/page/note` work when opened directly or refreshed. Older `#pages`, `#editor`, and `#page/...` bookmarks and Markdown links still work and resolve to clean paths.

- Click into the page title or body and type. Use the toolbar for headings and bold. No Markdown or HTML typing is needed.
- **Home** is fixed at the top of the editor sidebar and opens at `/editor/home` (also the default at `/editor`). Edit its title and body with the same text and media controls, then use **Save ↗** to open the homepage at `/`. Home is stored separately from ordinary pages and does not appear in All Pages.
- Right-click inside the page body for **Add image**, **Upload video**, and **YouTube URL** at that position. Press Escape or click outside to dismiss the menu.
- Paste an image from your clipboard at the text cursor, or choose **Add image**. Supported images: PNG, JPEG, GIF, WebP, AVIF.
- Hover over an image or video to show its trash icon at the top right. Click it to remove that media item, or select the item and press Backspace or Delete. The icon also appears when the media has keyboard focus.
- If the page ends with media, the editor keeps a typing line beneath it. With a media block selected, Enter or Arrow Down moves into text below; Arrow Up moves into text above, creating a paragraph only when needed. Clicking the blank area below the content also places the cursor at the end. Empty helper paragraphs stay out of exported Markdown; text you type into them is kept.
- Choose **Upload video** for a local file preview with playback controls. Videos start muted, with autoplay off; use the volume control to unmute. Playback depends on the browser's supported codecs. Files are limited to 40 MB each for this prototype.
- Paste a YouTube URL on its own, or use **YouTube URL**. It becomes a playable YouTube embed in the editor and garden. The player uses youtube-nocookie.com and requires internet access. The IFrame Player API calls `mute()` when the player is ready, with autoplay off; viewers can unmute normally. No API key, upload, Google account connection, or YouTube Data API is used. Some videos disallow embedding and cannot play inside the page.
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

- `index.html`, `style.css`: garden and editor layout, preserving the original garden design.
- `src/app.js`: editing, Markdown conversion, routing, local storage, and import/export.
- `src/routes.js`: clean paths and compatibility with older hash links.
- `server.py`: local static server with route fallback for direct visits and refreshes.
- `script.js`: checked-in browser bundle. The local server can run without installing dependencies.
- `content/entries.json`: starter content, separate from the website source.
- `content/home.json`: starter title and Markdown for the editable homepage.
- `sample.svg`: original geometric placeholder.

To change application behavior, install the locked development dependencies and rebuild the bundle:

```sh
npm ci
npm run build
```

The bundle contains marked, Turndown, DOMPurify, and fflate. Application dependencies are bundled locally; YouTube players load from YouTube when a video is shown. Keep the server bound to `127.0.0.1` for local review.
