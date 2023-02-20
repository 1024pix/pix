import randomString from 'randomstring';

export default {
  generateNumericalString(numberOfDigits) {
    return randomString.generate({
      charset: 'numeric',
      length: numberOfDigits,
      readable: true,
    });
  },
};
