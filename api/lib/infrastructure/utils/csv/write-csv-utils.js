const { parseAsync } = require('json2csv');
const { CsvParsingError } = require('../../../../lib/domain/errors.js');

async function getCsvContent({ data, delimiter = ';', eol = '\n', fileHeaders, withBOM = true }) {
  try {
    const options = { delimiter, eol, fields: fileHeaders, withBOM };
    const csvContent = await parseAsync(data, options);
    return csvContent;
  } catch (err) {
    throw new CsvParsingError();
  }
}

module.exports = {
  getCsvContent,
};
