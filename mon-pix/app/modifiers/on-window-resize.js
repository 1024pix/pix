import { modifier } from 'ember-modifier';

export default modifier(function onWindowResize(element, [action]) {
  const actionWithElement = () => action(element);

  window.addEventListener('resize', actionWithElement);
  actionWithElement();

  return () => {
    window.removeEventListener('resize', actionWithElement);
  };
});
