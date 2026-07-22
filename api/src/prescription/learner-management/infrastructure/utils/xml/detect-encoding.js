import buffer from 'node:buffer';
import * as fs from 'node:fs/promises';

import { FileValidationError } from '../../../../../shared/domain/errors.js';
import { logger } from '../../../../../shared/infrastructure/utils/logger.js';

const { Buffer } = buffer;

const DEFAULT_FILE_ENCODING = 'UTF-8';

const ERRORS = {
  INVALID_FILE: 'INVALID_FILE',
};

export async function detectEncoding(path) {
  const firstLine = await readFirstLine(path);
  return detectXmlEncoding(Buffer.from(firstLine));
}

function detectXmlEncoding(buffer) {
  const encoding = detectXmlEncodingFromBOM(buffer);
  if (encoding) {
    return encoding;
  }

  return detectXmlEncodingFromTag(buffer) ?? DEFAULT_FILE_ENCODING;
}

function detectXmlEncodingFromBOM(buffer) {
  if (buffer.length >= 4) {
    if (buffer[0] === 0x00 && buffer[1] === 0x00 && buffer[2] === 0xfe && buffer[3] === 0xff) return 'UTF-32BE';
    if (buffer[0] === 0xff && buffer[1] === 0xfe && buffer[2] === 0x00 && buffer[3] === 0x00) return 'UTF-32LE';
  }
  if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    return 'UTF-8';
  }
  if (buffer.length >= 2) {
    if (buffer[0] === 0xfe && buffer[1] === 0xff) return 'UTF-16BE';
    if (buffer[0] === 0xff && buffer[1] === 0xfe) return 'UTF-16LE';
  }
}

function detectXmlEncodingFromTag(buffer) {
  const head = buffer.toString('LATIN1');
  const match = head.match(/<\?xml[^>]*encoding=["']([^"']+)["']/i);
  if (match) {
    return match[1].toLowerCase();
  }
}

async function readFirstLine(path) {
  const buffer = Buffer.alloc(128);

  try {
    const file = await fs.open(path);
    await file.read(buffer, 0, 128, 0);
    file.close();
  } catch (err) {
    logger.error(err);
    throw new FileValidationError(ERRORS.INVALID_FILE);
  }

  return buffer;
}
