import randomString from 'randomstring';

const generateNumericalString = function (numberOfDigits) {
  return randomString.generate({
    charset: 'numeric',
    length: numberOfDigits,
    readable: true,
  });
};

export { generateNumericalString };
