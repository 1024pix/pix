const { parseAsync } = require('json2csv');
const { CsvParsingError } = require('../../../../lib/domain/errors');

async function getCsvContent({
  data,
  fileHeaders,
  delimiter = ';',
  withBOM = true,
}) {
  try {
    const options = { fields: fileHeaders, delimiter, withBOM };
    const csvContent = await parseAsync(data, options);
    return csvContent;
  } catch (err) {
    throw new CsvParsingError();
  }
}

module.exports = {
  getCsvContent,
};
