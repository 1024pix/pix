import { parseAsync } from 'json2csv';
import { CsvParsingError } from '../../../../lib/domain/errors';

async function getCsvContent({ data, delimiter = ';', eol = '\n', fileHeaders, withBOM = true }) {
  try {
    const options = { delimiter, eol, fields: fileHeaders, withBOM };
    const csvContent = await parseAsync(data, options);
    return csvContent;
  } catch (err) {
    throw new CsvParsingError();
  }
}

export default {
  getCsvContent,
};
