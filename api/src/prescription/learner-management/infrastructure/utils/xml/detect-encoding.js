import buffer from 'node:buffer';
import * as fs from 'node:fs/promises';

import xmlBufferTostring from 'xml-buffer-tostring';

import { FileValidationError } from '../../../../../../lib/domain/errors.js';
import { logErrorWithCorrelationIds } from '../../../../../../lib/infrastructure/monitoring-tools.js';

const { xmlEncoding } = xmlBufferTostring;
const { Buffer } = buffer;

const DEFAULT_FILE_ENCODING = 'UTF-8';

const ERRORS = {
  INVALID_FILE: 'INVALID_FILE',
};

async function detectEncoding(path) {
  const firstLine = await readFirstLine(path);
  return xmlEncoding(Buffer.from(firstLine)) || DEFAULT_FILE_ENCODING;
}

async function readFirstLine(path) {
  const buffer = Buffer.alloc(128);

  try {
    const file = await fs.open(path);
    await file.read(buffer, 0, 128, 0);
    file.close();
  } catch (err) {
    logErrorWithCorrelationIds(err);
    throw new FileValidationError(ERRORS.INVALID_FILE);
  }

  return buffer;
}
export { detectEncoding };
