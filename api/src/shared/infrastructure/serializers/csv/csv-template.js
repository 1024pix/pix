import { AsyncParser } from '@json2csv/node';

export async function generateCSVTemplate(fields) {
  const json2csvParser = new AsyncParser({
    withBOM: true,
    includeEmptyRows: false,
    fields,
    delimiter: ';',
  });
  return json2csvParser.parse([]).promise();
}
