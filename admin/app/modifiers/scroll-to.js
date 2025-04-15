import { modifier } from 'ember-modifier';

export const scrollToElement = modifier((element) => {
  const top = element.getBoundingClientRect().top;

  window.scrollTo({
    top,
    behavior: 'smooth',
  });
});
