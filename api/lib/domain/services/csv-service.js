function toCsvText(input) {
  return `"${input.toString().replace(/"/g, '""')}"`;
}

function toCsvNumber(input) {
  return input.toString().replace('.', ',');
}

module.exports = {
  toCsvText,
  toCsvNumber,
};
