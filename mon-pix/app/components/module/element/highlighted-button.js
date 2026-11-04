const TOOLTIP_OFFSET = 8;
const TOOLTIP_VIEWPORT_PADDING = 8;
const HIDE_DELAY_MS = 150;

let tooltipCounter = 0;
let openedInstance = null;

class HighlightedButton extends HTMLElement {
  #button = null;
  #tooltip = null;
  #arrow = null;
  #stopPositionTracking = null;
  #hideTimeout = null;
  #isPinned = false;

  connectedCallback() {
    if (!this.querySelector(':scope > button')) {
      this.#render();
    }
    if (!this.#tooltip) return;

    this.addEventListener('pointerenter', this.#onPointerEnter);
    this.addEventListener('pointerleave', this.#onPointerLeave);
    this.#button.addEventListener('focus', this.#open);
    this.#button.addEventListener('blur', this.#onBlur);
    this.#button.addEventListener('click', this.#togglePinned);
  }

  disconnectedCallback() {
    this.removeEventListener('pointerenter', this.#onPointerEnter);
    this.removeEventListener('pointerleave', this.#onPointerLeave);
    this.#button?.removeEventListener('focus', this.#open);
    this.#button?.removeEventListener('blur', this.#onBlur);
    this.#button?.removeEventListener('click', this.#togglePinned);
    this.#close();
  }

  #render() {
    this.#button = document.createElement('button');
    this.#button.type = 'button';
    this.#button.append(...this.childNodes);
    this.replaceChildren(this.#button);

    const definition = this.getAttribute('definition');
    if (!definition) return;

    const content = document.createElement('span');
    content.innerHTML = definition;

    this.#arrow = document.createElement('span');

    this.#tooltip = document.createElement('span');
    this.#tooltip.id = `glossary-tooltip-${++tooltipCounter}`;
    this.#tooltip.setAttribute('role', 'tooltip');
    this.#tooltip.className = 'module-glossary-tooltip';
    this.#tooltip.append(content, this.#arrow);

    this.#button.setAttribute('aria-expanded', 'false');
    this.#button.setAttribute('aria-describedby', this.#tooltip.id);
    this.append(this.#tooltip);
  }

  #open = () => {
    clearTimeout(this.#hideTimeout);
    if (this.#stopPositionTracking) return;

    if (openedInstance && openedInstance !== this) openedInstance.#close();
    openedInstance = this;

    this.#tooltip.classList.add('module-glossary-tooltip--visible');
    this.#button.setAttribute('aria-expanded', 'true');
    this.#stopPositionTracking = this.#trackPosition();
    document.addEventListener('pointerdown', this.#closeIfOutside);
    document.addEventListener('focusin', this.#closeIfOutside);
    document.addEventListener('keydown', this.#closeOnEscape);
  };

  #close = () => {
    clearTimeout(this.#hideTimeout);
    this.#isPinned = false;
    if (!this.#stopPositionTracking) return;

    if (openedInstance === this) openedInstance = null;

    this.#stopPositionTracking();
    this.#stopPositionTracking = null;
    this.#tooltip.classList.remove('module-glossary-tooltip--visible');
    this.#button.setAttribute('aria-expanded', 'false');
    document.removeEventListener('pointerdown', this.#closeIfOutside);
    document.removeEventListener('focusin', this.#closeIfOutside);
    document.removeEventListener('keydown', this.#closeOnEscape);
  };

  #onPointerEnter = (event) => {
    if (event.pointerType !== 'mouse') return;
    this.#open();
  };

  #onPointerLeave = (event) => {
    if (event.pointerType !== 'mouse' || this.#isPinned) return;
    clearTimeout(this.#hideTimeout);
    this.#hideTimeout = setTimeout(this.#close, HIDE_DELAY_MS);
  };

  #onBlur = () => {
    if (this.#isPinned) return;
    this.#close();
  };

  #togglePinned = () => {
    if (this.#isPinned) {
      this.#close();
      return;
    }
    this.#open();
    this.#isPinned = true;
  };

  #closeIfOutside = (event) => {
    if (!this.contains(event.target)) this.#close();
  };

  #closeOnEscape = (event) => {
    if (event.key === 'Escape') this.#close();
  };

  #trackPosition() {
    this.#updatePosition();
    window.addEventListener('scroll', this.#updatePosition, { capture: true, passive: true });
    window.addEventListener('resize', this.#updatePosition);
    return () => {
      window.removeEventListener('scroll', this.#updatePosition, { capture: true });
      window.removeEventListener('resize', this.#updatePosition);
    };
  }

  #updatePosition = () => {
    const buttonRect = this.#button.getBoundingClientRect();
    const { width: tooltipWidth, height: tooltipHeight } = this.#tooltip.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;

    const topY = buttonRect.top - TOOLTIP_OFFSET - tooltipHeight;
    const side = topY >= TOOLTIP_VIEWPORT_PADDING ? 'top' : 'bottom';
    const y = side === 'top' ? topY : buttonRect.bottom + TOOLTIP_OFFSET;

    const buttonCenterX = buttonRect.left + buttonRect.width / 2;
    const maxX = viewportWidth - tooltipWidth - TOOLTIP_VIEWPORT_PADDING;
    const x = clamp(buttonCenterX - tooltipWidth / 2, TOOLTIP_VIEWPORT_PADDING, maxX);

    Object.assign(this.#tooltip.style, { left: `${x}px`, top: `${y}px` });

    const arrowSize = this.#arrow.offsetWidth;
    const arrowX = clamp(buttonCenterX - x - arrowSize / 2, 0, tooltipWidth - arrowSize);
    Object.assign(this.#arrow.style, {
      left: `${arrowX}px`,
      top: side === 'bottom' ? `${-arrowSize / 2}px` : '',
      bottom: side === 'top' ? `${-arrowSize / 2}px` : '',
    });
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

export function defineHighlightedButton() {
  if (!customElements.get('highlighted-button')) {
    customElements.define('highlighted-button', HighlightedButton);
  }
}
