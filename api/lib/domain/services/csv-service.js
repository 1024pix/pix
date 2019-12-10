const _ = require('lodash');

const valueTypes = {
  TEXT: 'text',
  NUMBER: 'number',
};

function updateCsvLine({ line, rawData, headerPropertyMap }) {
  const headers =  _.map(headerPropertyMap, 'headerName');

  _.each(headerPropertyMap, (csvParams) => {
    line = updateCsvLineByProperty({ line, rawData, csvParams, headers });
  });
}

function updateCsvLineByProperty({ line, rawData, csvParams, headers }) {
  const { propertyName, headerName, type, value } = csvParams;

  // When the csv header to property map is dynaically generated, it is often
  // possible that the value is already known at the same moment. Therefore, the csv
  // service tries to look for such a pre-computed value first.
  const valueToInsert = value || rawData[propertyName];

  if (type === valueTypes.TEXT) {
    return addTextCell(headerName, valueToInsert, headers)(line);
  }
  if (type === valueTypes.NUMBER) {
    return addNumberCell(headerName, valueToInsert, headers)(line);
  }
  throw new Error(`Missing value type: ${type} for property: ${propertyName}`);
}

function addNumberCell(title, data, headers) {
  return (line) => {
    line[headers.indexOf(title)] = toCsvNumber(data);
    return line;
  };
}

function addTextCell(title, data, headers) {
  return (line) => {
    line[headers.indexOf(title)] = toCsvText(data);
    return line;
  };
}

const _surroundWith = (outterString) => (innerString) => [outterString, innerString, outterString].join('');

function getHeadersWithQuotes(headers) {
  return _.map(headers, _surroundWith('"'));
}

function toCsvText(input) {
  return `"${input.toString().replace(/"/g, '""')}"`;
}

function toCsvNumber(input) {
  return input.toString().replace('.', ',');
}

const insert = (item) => {
  return {
    into: (array) => {
      return {
        after: (header) => {
          const idx = _.findIndex(array, { headerName: header });
          const firstSlice = _.slice(array, 0, idx + 1);
          const secondSlice = _.slice(array, idx + 1);
          return _.concat(firstSlice, item, secondSlice);
        }
      };
    }
  };
};

function addDoubleQuotesToPlaceholders({ line, placeholder }) {
  _.each((line), (element, i) => {
    if (_.isEqual(element, placeholder)) {
      line[i] = _surroundWith('"')(placeholder);
    }
  });
}

// WHY: add \uFEFF the UTF-8 BOM at the start of the text, see:
// - https://en.wikipedia.org/wiki/Byte_order_mark
// - https://stackoverflow.com/a/38192870
function getHeaderLine(headers) {
  return '\uFEFF' + getHeadersWithQuotes(headers).join(';') + '\n';
}

function serializeLineWithPonctuationMarks(line) {
  return line.join(';') + '\n';
}

module.exports = {
  serializeLineWithPonctuationMarks,
  addDoubleQuotesToPlaceholders,
  updateCsvLine,
  getHeaderLine,
  valueTypes,
  insert,
};
