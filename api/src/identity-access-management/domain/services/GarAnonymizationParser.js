import { createReadStream } from 'node:fs';

import Joi from 'joi';

import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { validateEntity } from '../../../shared/domain/validators/entity-validator.js';
import { CsvColumn } from '../../../shared/infrastructure/serializers/csv/csv-column.js';
import { CsvParser } from '../../../shared/infrastructure/serializers/csv/csv-parser.js';
import { getDataBuffer } from '../../../shared/infrastructure/utils/buffer.js';

const CSV_HEADER = {
  columns: [
    new CsvColumn({
      isRequired: true,
      name: 'User ID',
      property: 'id',
    }),
  ],
};

const SCHEMA = Joi.array().items(Joi.object({ id: identifiersType.userId }));

async function getCsvData(filePath) {
  const stream = createReadStream(filePath);
  const buffer = await getDataBuffer(stream);
  const csvParser = new CsvParser(buffer, CSV_HEADER);
  const csvData = csvParser.parse();

  validateEntity(SCHEMA, csvData);
  return csvData.map(({ id }) => id);
}

export const GarAnonymizationParser = { CSV_HEADER, getCsvData };
