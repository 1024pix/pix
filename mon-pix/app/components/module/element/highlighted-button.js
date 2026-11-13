import breakpoints from 'mon-pix/breakpoints';

let tooltipCounter = 0;

class HighlightedButton extends HTMLElement {
  #tooltipElement = null;
  #buttonElement = null;

  connectedCallback() {
    const isAlreadyRendered = this.querySelector(':scope > button');
    if (isAlreadyRendered) {
      return;
    }

    const definition = this.getAttribute('definition');
    this.#tooltipElement = this.#createElementFromHTML(
      `<div id="glossary-tooltip-${++tooltipCounter}" role="tooltip" class="module-glossary-tooltip">${definition}</div>`,
    );
    this.#tooltipElement.style.setProperty('--definition-length', this.#tooltipElement.textContent.length);

    const word = this.textContent;
    this.#buttonElement = this.#createElementFromHTML(
      `<button type="button" class="module-glossary-word" aria-expanded="false" aria-describedby="${this.#tooltipElement.id}">${word}</button>`,
    );

    const isMobile = window.matchMedia(breakpoints.mobile).matches;
    if (isMobile) {
      this.#buttonElement.addEventListener('click', () => this.open());
    } else {
      this.#buttonElement.addEventListener('pointerenter', () => this.open());
      this.#buttonElement.addEventListener('pointerleave', () => this.close());
    }

    this.replaceChildren(this.#buttonElement, this.#tooltipElement);
  }

  open() {
    this.#tooltipElement.classList.add('module-glossary-tooltip--visible');
    this.#buttonElement.setAttribute('aria-expanded', 'true');
  }

  close() {
    this.#tooltipElement.classList.remove('module-glossary-tooltip--visible');
    this.#buttonElement.setAttribute('aria-expanded', 'false');
  }

  #createElementFromHTML(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
  }
}
export function defineHighlightedButton() {
  if (!customElements.get('highlighted-button')) {
    customElements.define('highlighted-button', HighlightedButton);
  }
}
