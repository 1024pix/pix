import { modifier } from 'ember-modifier';

export default modifier(function didInsert(htmlElement, [action]) {
  action(htmlElement);
});
