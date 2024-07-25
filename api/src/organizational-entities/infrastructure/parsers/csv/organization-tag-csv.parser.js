import { createReadStream } from 'node:fs';

import Joi from 'joi';

import { identifiersType } from '../../../../shared/domain/types/identifiers-type.js';
import { validateEntity } from '../../../../shared/domain/validators/entity-validator.js';
import { CsvColumn } from '../../../../shared/infrastructure/serializers/csv/csv-column.js';
import { CsvParser } from '../../../../shared/infrastructure/serializers/csv/csv-parser.js';
import { getDataBuffer } from '../../../../shared/infrastructure/utils/buffer.js';

const CSV_HEADER = {
  columns: [
    new CsvColumn({
      property: 'organizationId',
      name: 'Organization ID',
      isRequired: true,
    }),
    new CsvColumn({
      property: 'tagName',
      name: 'Tag name',
      isRequired: true,
    }),
  ],
};

const SCHEMA = Joi.array().items(
  Joi.object({ organizationId: identifiersType.organizationId, tagName: Joi.string().required() }),
);

async function getCsvData(filePath) {
  const stream = createReadStream(filePath);
  const buffer = await getDataBuffer(stream);
  const csvParser = new CsvParser(buffer, CSV_HEADER);
  const csvData = csvParser.parse();

  validateEntity(SCHEMA, csvData);
  return csvData;
}

export const organizationTagCsvParser = { CSV_HEADER, getCsvData };
