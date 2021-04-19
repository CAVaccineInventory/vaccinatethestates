import marked from "marked";
import sanitizeHtml from "sanitize-html";

function customMarked() {
  const renderer = new marked.Renderer();
  const linkRenderer = renderer.link;
  renderer.link = (href, title, text) => {
    const html = linkRenderer.call(renderer, href, title, text);

    if (href.startsWith(`${location.protocol}//${location.hostname}`)) {
      return html;
    }

    return html.replace(/^<a /, '<a target="_blank" rel="nofollow" ');
  };

  marked.use({ renderer });

  return marked;
}

function markdownify(str) {
  return sanitizeHtml(customMarked()(str));
}

function markdownifyInline(str) {
  return sanitizeHtml(customMarked().parseInline(str));
}

export { markdownify, markdownifyInline };
