const _ = require('lodash');

const valueTypes = {
  TEXT: 'text',
  NUMBER: 'number',
};

function getCsvLine({ rawData, headerPropertyMap, headers, placeholder }) {
  const line = _.map(headers, () => toCsvText(placeholder));

  const updatedLine = _.map(headerPropertyMap, ({ propertyName, type, value }) => {

    // When the csv header to property map is dynaically generated, it is often
    // possible that the value is already known at the same moment. Therefore, the csv
    // service tries to look for such a pre-computed value first.
    const valueToInsert =  _.isNil(value) ? rawData[propertyName] : value;
    const typeToSelect = type || valueTypes.TEXT;

    if (typeToSelect === valueTypes.TEXT) {
      return toCsvText(valueToInsert);
    }
    if (typeToSelect === valueTypes.NUMBER) {
      return toCsvNumber(valueToInsert);
    }
    throw new Error(`Missing value type: ${type} for property: ${propertyName}`);
  });

  const mergedLine = _.merge(line, updatedLine);
  return serializeLineWithPunctuationMarks(mergedLine);
}

function getHeadersWithQuotes(headers) {
  return _.map(headers, (header) => toCsvText(header));
}

function toCsvText(input) {
  return `"${input.toString().replace(/"/g, '""')}"`;
}

function toCsvNumber(input) {
  return input.toString().replace('.', ',');
}

// WHY: add \uFEFF the UTF-8 BOM at the start of the text, see:
// - https://en.wikipedia.org/wiki/Byte_order_mark
// - https://stackoverflow.com/a/38192870
function getHeadersLine(headers) {
  const BYTE_ORDER_MARK = '\uFEFF';
  return BYTE_ORDER_MARK + serializeLineWithPunctuationMarks(getHeadersWithQuotes(headers));
}

function serializeLineWithPunctuationMarks(line) {
  return line.join(';') + '\n';
}

module.exports = {
  getHeadersLine,
  getCsvLine,
  valueTypes,
};
