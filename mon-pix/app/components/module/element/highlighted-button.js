const TOOLTIP_OFFSET = 8;
const TOOLTIP_VIEWPORT_PADDING = 8;

let tooltipCounter = 0;
// The custom element is defined once for the whole page: it uses the intl service of the current app instance
let intl = null;

class HighlightedButton extends HTMLElement {
  #tooltipElement = null;
  #buttonElement = null;
  #closeButton = null;
  #liveRegion = null;
  #definition = null;

  connectedCallback() {
    const isAlreadyRendered = this.querySelector(':scope > button');
    if (isAlreadyRendered) {
      return;
    }

    this.#definition = this.getAttribute('definition');
    const id = ++tooltipCounter;
    const tooltipId = `glossary-tooltip-${id}`;
    const definitionId = `glossary-definition-${id}`;

    this.#tooltipElement = this.#createElementFromHTML(
      `<div id="${tooltipId}" class="module-glossary-tooltip">
      <img src="/images/modulix/definition-illustration.svg" class="module-glossary-tooltip__illustration" alt="" />
      <div id="${definitionId}">${this.#definition}</div>
      </div>`,
    );
    this.#tooltipElement.style.setProperty('--definition-length', this.#tooltipElement.textContent.length);

    this.#buttonElement = this.#createElementFromHTML(
      `<button type="button" class="module-glossary-word" aria-expanded="false"></button>`,
    );
    this.#buttonElement.textContent = this.textContent;

    const canHover = window.matchMedia('(hover: hover)').matches;
    if (canHover) {
      this.#setUpTooltip(definitionId);
      this.replaceChildren(this.#buttonElement, this.#tooltipElement);
    } else {
      this.#setUpToggletip(tooltipId, definitionId);
      this.replaceChildren(this.#buttonElement, this.#liveRegion, this.#tooltipElement);
    }

    this.addEventListener('focusout', (event) => {
      const isFocusStillInside = this.contains(event.relatedTarget);
      if (!isFocusStillInside) this.close();
    });
    this.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.#isOpen) {
        this.#closeAndReturnFocusToButton();
      }
    });
  }

  open() {
    this.#tooltipElement.classList.add('module-glossary-tooltip--visible');
    this.#buttonElement.setAttribute('aria-expanded', 'true');
    this.#positionTooltip();
    window.addEventListener('scroll', this.#positionTooltip, { capture: true, passive: true });
    window.addEventListener('resize', this.#positionTooltip, { passive: true });

    if (this.#liveRegion) {
      this.#liveRegion.innerHTML = this.#definition;
      document.addEventListener('click', this.#closeOnClickOutside);
    }
  }

  close() {
    this.#tooltipElement.classList.remove('module-glossary-tooltip--visible');
    this.#buttonElement.setAttribute('aria-expanded', 'false');
    this.#stopTrackingPosition();

    if (this.#liveRegion) {
      this.#liveRegion.replaceChildren();
      document.removeEventListener('click', this.#closeOnClickOutside);
    }
  }

  #setUpTooltip(definitionId) {
    this.#tooltipElement.setAttribute('role', 'tooltip');
    this.#buttonElement.setAttribute('aria-describedby', definitionId);

    this.#buttonElement.addEventListener('pointerenter', () => this.open());
    this.#buttonElement.addEventListener('pointerleave', () => this.close());
    this.#buttonElement.addEventListener('focus', () => this.open());
  }

  #setUpToggletip(tooltipId, definitionId) {
    this.#liveRegion = this.#createElementFromHTML(`<span role="status" class="sr-only"></span>`);
    this.#buttonElement.setAttribute('aria-controls', tooltipId);

    this.#buttonElement.setAttribute(
      'aria-label',
      intl.t('pages.modulix.elements.text.glossary.word-label', { word: this.#buttonElement.textContent }),
    );

    // Set aria-hidden=true because the definition is vocalized by the live region
    this.#tooltipElement.querySelector(`#${definitionId}`).setAttribute('aria-hidden', 'true');

    this.#closeButton = this.#createElementFromHTML(
      `<button type="button" class="module-glossary-tooltip__close-button"></button>`,
    );
    this.#closeButton.textContent = intl.t('pages.modulix.elements.text.glossary.close-button');
    this.#closeButton.addEventListener('click', () => this.#closeAndReturnFocusToButton());
    this.#tooltipElement.append(this.#closeButton);

    this.#tooltipElement.addEventListener('mousedown', (event) => event.preventDefault());

    this.#buttonElement.addEventListener('click', () => (this.#isOpen ? this.close() : this.open()));
  }

  #closeOnClickOutside = (event) => {
    if (!this.contains(event.target)) this.close();
  };

  get #isOpen() {
    return this.#tooltipElement.classList.contains('module-glossary-tooltip--visible');
  }

  #closeAndReturnFocusToButton() {
    this.close();
    this.#buttonElement.focus();
  }

  disconnectedCallback() {
    this.#stopTrackingPosition();
    document.removeEventListener('click', this.#closeOnClickOutside);
  }

  #stopTrackingPosition() {
    window.removeEventListener('scroll', this.#positionTooltip, { capture: true });
    window.removeEventListener('resize', this.#positionTooltip);
  }

  #createElementFromHTML(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
  }

  #positionTooltip = () => {
    const tooltipContainerPosition = { left: '0px', top: '0px' };
    Object.assign(this.#tooltipElement.style, {
      left: tooltipContainerPosition.left,
      top: tooltipContainerPosition.top,
    });

    const buttonInformation = this.#buttonElement.getBoundingClientRect();
    const tooltipInformation = this.#tooltipElement.getBoundingClientRect();
    const containingBlockOrigin = { left: tooltipInformation.left, top: tooltipInformation.top };

    const tooltipTop = this.#computeTooltipTop(buttonInformation, tooltipInformation);
    const tooltipLeft = this.#computeTooltipLeft(buttonInformation, tooltipInformation);

    Object.assign(this.#tooltipElement.style, {
      left: `${tooltipLeft - containingBlockOrigin.left}px`,
      top: `${tooltipTop - containingBlockOrigin.top}px`,
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
export function defineHighlightedButton({ intl: intlService }) {
  intl = intlService;
  if (!customElements.get('highlighted-button')) {
    customElements.define('highlighted-button', HighlightedButton);
  }
}
