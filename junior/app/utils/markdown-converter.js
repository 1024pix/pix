import showdown from 'showdown';

const DEFAULT_OPTIONS = {
  openLinksInNewWindow: true,
  strikethrough: true,
  extensions: [],
};

export function toHTML(text, options = {}) {
  const converter = new showdown.Converter({ ...DEFAULT_OPTIONS, ...options });
  return converter.makeHtml(text);
}
