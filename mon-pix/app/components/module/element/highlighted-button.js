class HighlightedButton extends HTMLElement {}
export function defineHighlightedButton() {
  if (!customElements.get('highlighted-button')) {
    customElements.define('highlighted-button', HighlightedButton);
  }
}
