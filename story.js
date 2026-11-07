(function () {
  const content = document.querySelector("#story-content");
  if (!content) return;

  const contentUrl = new URL(content.dataset.markdown, document.baseURI);

  function appendInlineMarkdown(parent, text) {
    const tokenPattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
    let offset = 0;

    for (const match of text.matchAll(tokenPattern)) {
      parent.append(document.createTextNode(text.slice(offset, match.index)));
      const token = match[0];
      let element;

      if (token.startsWith("**")) {
        element = document.createElement("strong");
        element.textContent = token.slice(2, -2);
      } else if (token.startsWith("*")) {
        element = document.createElement("em");
        element.textContent = token.slice(1, -1);
      } else if (token.startsWith("`")) {
        element = document.createElement("code");
        element.textContent = token.slice(1, -1);
      } else {
        const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        const target = new URL(linkMatch[2], contentUrl);
        if (!["http:", "https:", "mailto:"].includes(target.protocol)) {
          parent.append(document.createTextNode(token));
          offset = match.index + token.length;
          continue;
        }
        element = document.createElement("a");
        element.href = target.href;
        element.textContent = linkMatch[1];
        if (target.origin !== location.origin) {
          element.target = "_blank";
          element.rel = "noopener noreferrer";
        }
      }

      parent.append(element);
      offset = match.index + token.length;
    }

    parent.append(document.createTextNode(text.slice(offset)));
  }

  function createImageBlock(line) {
    const match = line.match(/^!\[([^\]]*)\]\((\S+?)(?:\s+["']([^"']*)["'])?\)$/);
    if (!match) return null;

    const figure = document.createElement("figure");
    figure.className = "story-image";
    const image = document.createElement("img");
    const source = new URL(match[2], contentUrl);
    if (!["http:", "https:"].includes(source.protocol)) return null;
    image.src = source.href;
    image.alt = match[1];
    image.loading = "lazy";
    image.decoding = "async";
    figure.append(image);

    if (match[3]) {
      const caption = document.createElement("figcaption");
      caption.textContent = match[3];
      figure.append(caption);
    }

    return figure;
  }

  function renderMarkdown(markdown) {
    const fragment = document.createDocumentFragment();
    let paragraphLines = [];

    function flushParagraph() {
      if (!paragraphLines.length) return;
      const paragraph = document.createElement("p");
      appendInlineMarkdown(paragraph, paragraphLines.join(" "));
      fragment.append(paragraph);
      paragraphLines = [];
    }

    for (const line of markdown.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed) {
        flushParagraph();
        continue;
      }

      const image = createImageBlock(trimmed);
      if (image) {
        flushParagraph();
        fragment.append(image);
        continue;
      }

      const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
      if (heading) {
        flushParagraph();
        const element = document.createElement(heading[1].length <= 2 ? "h2" : "h3");
        appendInlineMarkdown(element, heading[2]);
        fragment.append(element);
        continue;
      }

      paragraphLines.push(trimmed);
    }

    flushParagraph();
    return fragment;
  }

  fetch(contentUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Could not load story content (${response.status})`);
      }
      return response.text();
    })
    .then((markdown) => {
      content.replaceChildren(renderMarkdown(markdown));
    })
    .catch((error) => {
      console.error("Could not load the Siberut story.", error);
      content.replaceChildren();
      const message = document.createElement("p");
      message.setAttribute("role", "alert");
      message.textContent = "Historien kunne ikke lastes. Prøv igjen senere.";
      content.append(message);
    });

  const shareButton = document.querySelector("#story-share");
  const shareStatus = document.querySelector("#story-share-status");
  const facebookLink = document.querySelector("#story-facebook-share");
  if (facebookLink) {
    const shareUrl = new URL("https://www.facebook.com/sharer/sharer.php");
    shareUrl.searchParams.set("u", location.href);
    facebookLink.href = shareUrl.href;
  }

  if (shareButton && shareStatus) {
    shareButton.addEventListener("click", async () => {
      try {
        if (navigator.share) {
          await navigator.share({
            title: document.title,
            text: "Ti dager i en Uma på Siberut – Mentawai 2000",
            url: location.href
          });
          shareStatus.textContent = "";
          return;
        }

        await navigator.clipboard.writeText(location.href);
        shareStatus.textContent = "Lenken er kopiert. Del den i Facebook eller Instagram.";
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Could not share the Siberut story.", error);
        shareStatus.textContent = "Deling er ikke tilgjengelig her. Kopier lenken fra adressefeltet.";
      }
    });
  }
})();
