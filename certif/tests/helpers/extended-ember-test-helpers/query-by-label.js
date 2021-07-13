import { findAll } from '@ember/test-helpers';

export default function queryByLabel(labelText) {
  const label = _findLabel(labelText);
  if (label) {
    if (!label.control) {
      throw new Error(`Found label "${labelText}" but no associated form control.`);
    }

    return label.control;
  }

  const labelledElement = _findElementForLabel(labelText);
  if (!labelledElement) {
    return null;
  }

  return labelledElement;
}

function _findElementForLabel(labelText) {
  const clickableSelectors = ['button', 'a[href]', '[role="button"]', 'input[type="radio"]', 'input[type="checkbox"]', 'label[for]'];
  return findAll(clickableSelectors.join(',')).find(_matchesLabel(labelText));
}

function _findLabel(labelText) {
  return findAll('label').find((label) => label.innerText.includes(labelText));
}

function _matchesLabel(labelText) {
  return (element) => _matchesInnerText(element, labelText) ||
    _matchesTitle(element, labelText) ||
    _matchesAriaLabel(element, labelText);
}

function _matchesInnerText(element, labelText) {
  return element.innerText.includes(labelText);
}

function _matchesTitle(element, labelText) {
  return element.title && element.title.includes(labelText);
}

function _matchesAriaLabel(element, labelText) {
  const ariaLabel = element.getAttribute('aria-label');
  return ariaLabel && ariaLabel.includes(labelText);
}
