import { defineHighlightedButton } from '../components/module/element/highlighted-button';

export function initialize(applicationInstance) {
  defineHighlightedButton({ intl: applicationInstance.lookup('service:intl') });
}

export default {
  name: 'highlighted-button',
  initialize,
};
