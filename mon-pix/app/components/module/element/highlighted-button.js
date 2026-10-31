import { arrow, autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';

const TOOLTIP_OFFSET = 8;
const TOOLTIP_VIEWPORT_PADDING = 8;
const HIDE_DELAY_MS = 150;
const OPPOSITE_SIDES = { top: 'bottom', right: 'left', bottom: 'top', left: 'right' };

let tooltipCounter = 0;
let openedInstance = null;

class HighlightedButton extends HTMLElement {
  #button = null;
  #tooltip = null;
  #arrow = null;
  #cleanupAutoUpdate = null;
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
    this.#button.className = 'module-glossary-word';
    this.#button.append(...this.childNodes);
    this.replaceChildren(this.#button);

    const definition = this.getAttribute('definition');
    if (!definition) return;

    const content = document.createElement('span');
    content.innerHTML = definition;

    this.#arrow = document.createElement('span');
    this.#arrow.className = 'module-glossary-tooltip__arrow';

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
    if (this.#cleanupAutoUpdate) return;

    if (openedInstance && openedInstance !== this) openedInstance.#close();
    openedInstance = this;

    this.#tooltip.classList.add('module-glossary-tooltip--visible');
    this.#button.setAttribute('aria-expanded', 'true');
    this.#cleanupAutoUpdate = autoUpdate(this.#button, this.#tooltip, this.#updatePosition);
    document.addEventListener('pointerdown', this.#closeIfOutside);
    document.addEventListener('focusin', this.#closeIfOutside);
    document.addEventListener('keydown', this.#closeOnEscape);
  };

  #close = () => {
    clearTimeout(this.#hideTimeout);
    this.#isPinned = false;
    if (!this.#cleanupAutoUpdate) return;

    if (openedInstance === this) openedInstance = null;

    this.#cleanupAutoUpdate();
    this.#cleanupAutoUpdate = null;
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

  #updatePosition = async () => {
    const { x, y, placement, middlewareData } = await computePosition(this.#button, this.#tooltip, {
      strategy: 'fixed',
      placement: 'top',
      middleware: [
        offset(TOOLTIP_OFFSET),
        flip(),
        shift({ padding: TOOLTIP_VIEWPORT_PADDING }),
        arrow({ element: this.#arrow }),
      ],
    });

    Object.assign(this.#tooltip.style, { left: `${x}px`, top: `${y}px` });

    const side = placement.split('-')[0];
    const { x: arrowX, y: arrowY } = middlewareData.arrow;
    Object.assign(this.#arrow.style, {
      left: arrowX != null ? `${arrowX}px` : '',
      top: arrowY != null ? `${arrowY}px` : '',
      right: '',
      bottom: '',
      [OPPOSITE_SIDES[side]]: `${-this.#arrow.offsetWidth / 2}px`,
    });
  };
}

export function defineHighlightedButton() {
  if (!customElements.get('highlighted-button')) {
    customElements.define('highlighted-button', HighlightedButton);
  }
}
