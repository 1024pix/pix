import Helper from '@ember/component/helper';

export default class NumberFormat extends Helper {

  compute([ number ]) {
    return new Intl.NumberFormat(navigator.language, { maximumFractionDigits: 2 }).format(number);
  }
}
