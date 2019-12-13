function standardizeNumber(number, size) {
  let numberInString = parseInt(number) + '';
  while (numberInString.length < size) numberInString = '0' + numberInString;
  return numberInString;
}

function standardizeNumberInTwoDigitFormat(number) {
  return standardizeNumber(number, 2);
}

export {
  standardizeNumber,
  standardizeNumberInTwoDigitFormat,
};
