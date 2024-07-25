import { AsyncParser } from '@json2csv/node';

import { CsvParsingError } from '../../../domain/errors.js';

async function getCsvContent({ data, delimiter = ';', eol = '\n', fileHeaders, withBOM = true }) {
  try {
    const parser = new AsyncParser({ delimiter, eol, fields: fileHeaders, withBOM });
    return parser.parse(data).promise();
  } catch (err) {
    throw new CsvParsingError();
  }
}

export { getCsvContent };
