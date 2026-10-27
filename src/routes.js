// Keep old saved Markdown links and bookmarks working while using clean URLs.
export function gardenPath(value) {
  const path = value.startsWith('#') ? `/${value.slice(1)}` : value;
  if (path === '/') return '/';
  if (/^\/(?:pages|editor)\/?$/.test(path) || /^\/(?:page|editor)\/[A-Za-z0-9_-]+\/?$/.test(path)) return path.replace(/\/$/, '');
  return null;
}

export function cleanMarkdownLinks(markdown) {
  return markdown.replace(/\]\((#(?:pages|editor|(?:page|editor)\/[A-Za-z0-9_-]+))\)/g, (match, target) => `](${gardenPath(target)})`);
}
