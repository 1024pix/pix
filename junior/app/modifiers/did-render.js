import { modifier } from 'ember-modifier';

/**
 * did-render is a modifier that executes the fn function passed as first arg
 * each time the component is rendered
 **/
export default modifier(function (element, args) {
  const [fn, ...positional] = args;
  fn(element, positional);
});
