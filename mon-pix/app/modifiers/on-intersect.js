import { modifier } from 'ember-modifier';

export default modifier(function onIntersect(element, [callback], { threshold = 0 } = {}) {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        callback?.();
        observer.disconnect();
      }
    },
    { threshold },
  );

  observer.observe(element);

  return () => observer.disconnect();
});
