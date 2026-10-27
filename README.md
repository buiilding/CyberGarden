# CyberGarden — local garden and editor

A quiet personal garden with a separate document editor. Sample pages are neutral placeholders. Everything runs in this project; there is no backend, authentication service, publishing, analytics, remote font, or external API connection.

## Try it

```sh
npm start
```

Open **http://127.0.0.1:4183**. Use **Open local editor** in the sidebar or **Edit this page** on a garden page. This control opens a mock editor directly; it is not real authentication. The editor is also at http://127.0.0.1:4183/#editor.

- Click into the page title or body and type. Use the toolbar for headings, bold, italic, and links. No Markdown or HTML typing is needed.
- Right-click inside the page body for **Add image**, **Upload video**, and **YouTube URL** at that position. Press Escape or click outside to dismiss the menu.
- Paste an image from your clipboard at the text cursor, or choose **Add image**. Supported images: PNG, JPEG, GIF, WebP, AVIF.
- Select a media item and press Backspace or Delete to remove it.
- Choose **Upload video** for a local file preview with playback controls. Playback depends on the browser's supported codecs. Files are limited to 40 MB each for this prototype.
- Paste a YouTube URL on its own, or use **YouTube URL**. It becomes a clear placeholder; no remote player, thumbnail request, upload, or YouTube API is used.
- Choose **+ New page**, or **Import Markdown…** to create a page from a `.md` file or a garden ZIP. An initial `# Heading` becomes the separate title; the remaining Markdown is the body.
- Use **View this page** or **View garden** to see saved edits in the garden. They also appear under **All Pages**.

## Local storage and content

`content/entries.json` holds starter records with separate `title` and `markdown` fields. It is loaded only when this browser has no saved entries. Editing does not change the source files. Browser edits and selected media are saved to IndexedDB (`cybergarden-local-v1`) on this exact origin, including its port. Use the same preview URL and browser to return to them. Browser storage can be cleared or evicted; exports are the portable copy. This prototype does not sync tabs or devices.

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

A `.md` file contains references, not binary media. **Export with media (.zip)** includes the Markdown plus referenced local media in `assets/` and a small explanatory README. Import the ZIP here to restore the page with its media, or unpack it to use the Markdown elsewhere. Import always creates a new page. Importing a `.md` without its local media retains the reference and shows a missing-file placeholder. External references remain references and are not downloaded. Video links may appear as links in other Markdown readers; that is intentional portability.

## Source and rebuild

- `index.html`, `style.css`: garden and editor layout, preserving the original garden design.
- `src/app.js`: editing, Markdown conversion, routing, local storage, and import/export.
- `script.js`: checked-in browser bundle. The local server can run without installing dependencies.
- `content/entries.json`: starter content, separate from the website source.
- `sample.svg`: original geometric placeholder.

To change application behavior, install the locked development dependencies and rebuild the bundle:

```sh
npm ci
npm run build
```

The bundle contains marked, Turndown, DOMPurify, and fflate. There are no runtime CDN requests. Keep the server bound to `127.0.0.1` for local review.
