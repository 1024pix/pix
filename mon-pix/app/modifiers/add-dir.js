import { modifier } from 'ember-modifier';

export default modifier((element, [language]) => {
  if (language === 'ar') {
    document.getElementsByTagName('html')[0].dir = 'rtl';
  } else {
    document.getElementsByTagName('html')[0].dir = 'ltr';
  }
});
