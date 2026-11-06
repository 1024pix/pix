let tooltipCounter = 0;

class HighlightedButton extends HTMLElement {
  #tooltipElement = null;
  #buttonElement = null;
  #isTooltipOpen = false;

  connectedCallback() {
    const isAlreadyRendered = this.querySelector(":scope > button");
    if (isAlreadyRendered) {
      return;
    }

    const definition = this.getAttribute("definition");
    this.#tooltipElement = this.#createElementFromHTML(
      `<div id="glossary-tooltip-${++tooltipCounter}" role="tooltip" class="module-glossary-tooltip">${definition}</div>`
    );

    const word = this.textContent;
    this.#buttonElement = this.#createElementFromHTML(
      `<button type="button" aria-expanded="false" aria-describedby="${this.#tooltipElement.id}}">${word}</button>`
    );

    this.#buttonElement.addEventListener("click", () => this.toggle());

    this.replaceChildren(this.#buttonElement, this.#tooltipElement);
  }

  toggle() {
    if (this.#isTooltipOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.#tooltipElement.classList.add("module-glossary-tooltip--visible");
    this.#buttonElement.setAttribute("aria-expanded", "true");
    this.#isTooltipOpen = true;
  }

  close() {
    this.#tooltipElement.classList.remove("module-glossary-tooltip--visible");
    this.#buttonElement.setAttribute("aria-expanded", "false");
    this.#isTooltipOpen = false;
  }

  #createElementFromHTML(html) {
    const template = document.createElement("template");
    template.innerHTML = html.trim();
    return template.content.firstChild;
  }
}

export function defineHighlightedButton() {
  if (!customElements.get("highlighted-button")) {
    customElements.define("highlighted-button", HighlightedButton);
  }
}
