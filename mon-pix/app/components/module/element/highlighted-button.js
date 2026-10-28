import { arrow, autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';

export const GLOSSARY_WORD_ACTIVATE_EVENT = 'glossary-word-activate';

const TOOLTIP_OFFSET = 8;
const TOOLTIP_VIEWPORT_PADDING = 8;
const HIDE_DELAY_MS = 100;
const OPPOSITE_SIDES = { top: 'bottom', right: 'left', bottom: 'top', left: 'right' };

let tooltipCounter = 0;

class HighlightedButton extends HTMLElement {
  #button = null;
  #tooltip = null;
  #arrow = null;
  #cleanupAutoUpdate = null;
  #hideTimeout = null;

  connectedCallback() {
    if (!this.querySelector(':scope > button')) {
      this.#render();
    }

    this.addEventListener('click', this.#activate);
    this.addEventListener('mouseenter', this.#showTooltip);
    this.addEventListener('mouseleave', this.#scheduleHideTooltip);
    this.addEventListener('focusin', this.#showTooltip);
    this.addEventListener('focusout', this.#hideTooltip);
    this.addEventListener('keydown', this.#onKeydown);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.#activate);
    this.removeEventListener('mouseenter', this.#showTooltip);
    this.removeEventListener('mouseleave', this.#scheduleHideTooltip);
    this.removeEventListener('focusin', this.#showTooltip);
    this.removeEventListener('focusout', this.#hideTooltip);
    this.removeEventListener('keydown', this.#onKeydown);
    this.#hideTooltip();
  }

  #render() {
    this.#button = document.createElement('button');
    this.#button.type = 'button';
    this.#button.className = 'module-glossary-word';
    this.#button.setAttribute('aria-haspopup', 'dialog');
    this.#button.append(...this.childNodes);
    this.replaceChildren(this.#button);

    const definition = this.getAttribute('definition');
    if (definition) {
      const content = document.createElement('span');
      content.innerHTML = definition;

      this.#arrow = document.createElement('span');
      this.#arrow.className = 'module-glossary-tooltip__arrow';

      this.#tooltip = document.createElement('span');
      this.#tooltip.id = `glossary-tooltip-${++tooltipCounter}`;
      this.#tooltip.setAttribute('role', 'tooltip');
      this.#tooltip.className = 'module-glossary-tooltip';
      this.#tooltip.append(content, this.#arrow);

      this.#button.setAttribute('aria-describedby', this.#tooltip.id);
      this.append(this.#tooltip);
    }
  }

  #showTooltip = () => {
    clearTimeout(this.#hideTimeout);
    if (!this.#tooltip || this.#cleanupAutoUpdate) return;

    this.#tooltip.classList.add('module-glossary-tooltip--visible');
    this.#cleanupAutoUpdate = autoUpdate(this.#button, this.#tooltip, this.#updatePosition);
  };

  #scheduleHideTooltip = () => {
    clearTimeout(this.#hideTimeout);
    this.#hideTimeout = setTimeout(this.#hideTooltip, HIDE_DELAY_MS);
  };

  #hideTooltip = () => {
    clearTimeout(this.#hideTimeout);
    this.#cleanupAutoUpdate?.();
    this.#cleanupAutoUpdate = null;
    this.#tooltip?.classList.remove('module-glossary-tooltip--visible');
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

  #onKeydown = (event) => {
    if (event.key === 'Escape') {
      this.#hideTooltip();
    }
  };

  #activate = (event) => {
    if (this.#tooltip?.contains(event.target)) return;

    this.dispatchEvent(
      new CustomEvent(GLOSSARY_WORD_ACTIVATE_EVENT, {
        bubbles: true,
        detail: { word: this.getAttribute('word') ?? this.#button.textContent.trim() },
      }),
    );
  };
}

export function defineHighlightedButton() {
  if (!customElements.get('highlighted-button')) {
    customElements.define('highlighted-button', HighlightedButton);
  }
}
