import breakpoints from 'mon-pix/breakpoints';

const TOOLTIP_OFFSET = 8;
const TOOLTIP_VIEWPORT_PADDING = 8;

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
    this.#buttonElement.addEventListener('focus', () => this.open());
    this.#buttonElement.addEventListener('blur', () => this.close());

    this.replaceChildren(this.#buttonElement, this.#tooltipElement);
  }

  open() {
    this.#tooltipElement.classList.add('module-glossary-tooltip--visible');
    this.#buttonElement.setAttribute('aria-expanded', 'true');
    this.#positionTooltip();
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

  #positionTooltip = () => {
    const buttonInformation = this.#buttonElement.getBoundingClientRect();
    const tooltipInformation = this.#tooltipElement.getBoundingClientRect();

    const tooltipTop = this.#computeTooltipTop(buttonInformation, tooltipInformation);
    const tooltipLeft = this.#computeTooltipLeft(buttonInformation, tooltipInformation);

    Object.assign(this.#tooltipElement.style, {
      left: `${tooltipLeft}px`,
      top: `${tooltipTop}px`,
    });
  };

  #computeTooltipTop(buttonInformation, tooltipInformation) {
    const forbiddenZoneBottom = document.documentElement.clientHeight - TOOLTIP_VIEWPORT_PADDING;

    const tooltipTopIfIsBelowButton = buttonInformation.bottom + TOOLTIP_OFFSET;
    const tooltipTopIfIsAboveButton = buttonInformation.top - TOOLTIP_OFFSET - tooltipInformation.height;

    const tooltipBottom = tooltipTopIfIsBelowButton + tooltipInformation.height;

    const isInForbiddenZone = tooltipBottom >= forbiddenZoneBottom;
    return isInForbiddenZone ? tooltipTopIfIsAboveButton : tooltipTopIfIsBelowButton;
  }

  #computeTooltipLeft(buttonInformation, tooltipInformation) {
    const forbiddenZoneRight = document.documentElement.clientWidth - TOOLTIP_VIEWPORT_PADDING;

    const tooltipLeftDefaultPosition = buttonInformation.left;
    const tooltipRightPosition = buttonInformation.left + tooltipInformation.width;

    const isInForbiddenZone = tooltipRightPosition >= forbiddenZoneRight;
    return isInForbiddenZone ? buttonInformation.right - tooltipInformation.width : tooltipLeftDefaultPosition;
  }
}
export function defineHighlightedButton() {
  if (!customElements.get('highlighted-button')) {
    customElements.define('highlighted-button', HighlightedButton);
  }
}
