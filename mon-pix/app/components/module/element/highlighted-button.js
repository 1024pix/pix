export const GLOSSARY_WORD_ACTIVATE_EVENT = 'glossary-word-activate';

let tooltipCounter = 0;

class HighlightedButton extends HTMLElement {
  #tooltip = null;

  connectedCallback() {
    if (!this.querySelector(':scope > button')) {
      this.#render();
    }

    this.addEventListener('click', this.#activate);
    this.addEventListener('mouseenter', this.#showTooltip);
    this.addEventListener('mouseleave', this.#hideTooltip);
    this.addEventListener('focusin', this.#showTooltip);
    this.addEventListener('focusout', this.#hideTooltip);
    this.addEventListener('keydown', this.#onKeydown);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.#activate);
    this.removeEventListener('mouseenter', this.#showTooltip);
    this.removeEventListener('mouseleave', this.#hideTooltip);
    this.removeEventListener('focusin', this.#showTooltip);
    this.removeEventListener('focusout', this.#hideTooltip);
    this.removeEventListener('keydown', this.#onKeydown);
  }

  #render() {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'module-glossary-word';
    button.setAttribute('aria-haspopup', 'dialog');
    button.append(...this.childNodes);
    this.replaceChildren(button);

    const definition = this.getAttribute('definition');
    if (definition) {
      this.#tooltip = document.createElement('span');
      this.#tooltip.id = `glossary-tooltip-${++tooltipCounter}`;
      this.#tooltip.setAttribute('role', 'tooltip');
      this.#tooltip.className = 'module-glossary-tooltip';
      this.#tooltip.innerHTML = definition;
      button.setAttribute('aria-describedby', this.#tooltip.id);
      this.append(this.#tooltip);
    }
  }

  #showTooltip = () => {
    this.#tooltip?.classList.add('module-glossary-tooltip--visible');
  };

  #hideTooltip = () => {
    this.#tooltip?.classList.remove('module-glossary-tooltip--visible');
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
        detail: { word: this.getAttribute('word') ?? this.querySelector(':scope > button').textContent.trim() },
      }),
    );
  };
}

export function defineHighlightedButton() {
  if (!customElements.get('highlighted-button')) {
    customElements.define('highlighted-button', HighlightedButton);
  }
}
