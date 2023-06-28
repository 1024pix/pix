import { parseAsync } from 'json2csv';

import { CsvParsingError } from '../../../../src/shared/domain/errors.js';

async function getCsvContent({ data, delimiter = ';', eol = '\n', fileHeaders, withBOM = true }) {
  try {
    const options = { delimiter, eol, fields: fileHeaders, withBOM };
    const csvContent = await parseAsync(data, options);
    return csvContent;
  } catch (err) {
    throw new CsvParsingError();
  }
}

export { getCsvContent };
