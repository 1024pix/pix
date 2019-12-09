const _ = require('lodash');

function getUpdatedCsvLine({ line, rawData, headerPropertyMap, propertyName }) {
  const headers =  _.map(headerPropertyMap, 'headerName');
  const value = rawData[propertyName];
  const header = _.find(headerPropertyMap, { propertyName }).headerName;

  return addTextCell(header, value, headers)(line);
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

function toCsvText(input) {
  return `"${input.toString().replace(/"/g, '""')}"`;
}

function toCsvNumber(input) {
  return input.toString().replace('.', ',');
}

module.exports = {
  getUpdatedCsvLine,
  addNumberCell,
  addTextCell,
};
