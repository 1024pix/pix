import { click, findAll } from '@ember/test-helpers';

export function clickByLabel(labelText) {
  const clickableElement = _findClickableElementForLabel(labelText);

  if (!clickableElement) {
    throw new Error(`Cannot find clickable element labelled "${labelText}".`);
  }

  return click(clickableElement);
}

function _findClickableElementForLabel(labelText) {
  const clickableSelectors = ['button', 'a[href]', '[role="button"]', 'input[type="radio"]', 'input[type="checkbox"]', 'label[for]'];
  return findAll(clickableSelectors.join(',')).find(_matchesLabel(labelText));
}

function _matchesLabel(labelText) {
  return (element) => _matchesInnerText(element, labelText) ||
                      _matchesTitle(element, labelText) ||
                      _matchesAriaLabel(element, labelText);
}

function _matchesInnerText(element, labelText) {
  return element.textContent.match(labelText);
}

function _matchesTitle(element, labelText) {
  return element.title && element.title.match(labelText);
}

function _matchesAriaLabel(element, labelText) {
  const ariaLabel = element.getAttribute('aria-label');
  return ariaLabel && ariaLabel.match(labelText);
}
