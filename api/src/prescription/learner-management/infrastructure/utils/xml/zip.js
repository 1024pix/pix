import _ from 'lodash';
const { isObject, values } = _;
import fs from 'node:fs';
const fsPromises = fs.promises;
import { randomUUID } from 'node:crypto';
import os from 'node:os';
import Path from 'node:path';

import { fileTypeFromFile } from 'file-type';
import StreamZip from 'node-stream-zip';

import { FileValidationError } from '../../../../../shared/domain/errors.js';
import { logger } from '../../../../../shared/infrastructure/utils/logger.js';

const VALID_FILE_NAME_REGEX = /^([^.][^/]*\/)*[^./][^/]*\.xml$/;
const ZIP = 'application/zip';
const ERRORS = {
  INVALID_FILE: 'INVALID_FILE',
  ENCODING_NOT_SUPPORTED: 'ENCODING_NOT_SUPPORTED',
};

export async function unzip(path) {
  let file = path;
  if (!(await _isFileZipped(path))) return { directory: null, file };
  const directory = await _createTempDir();
  file = await _unzipFile(directory, path);
  return { directory, file };
}

async function _isFileZipped(path) {
  const fileType = await fileTypeFromFile(path);
  return isObject(fileType) && fileType.mime === ZIP;
}

function _createTempDir() {
  const tmpDir = os.tmpdir();
  const directory = Path.join(tmpDir, 'import-siecle-');
  return fsPromises.mkdtemp(directory);
}

async function _unzipFile(directory, path) {
  const extractedFileName = Path.join(directory, `organization-learners-${randomUUID()}.xml`);
  let fileNames;
  try {
    const zip = new StreamZip.async({ file: path });
    fileNames = await _getFilesToExtractName(zip);

    if (fileNames.length != 1) {
      await zip.close();
      logger.error({ ERROR: ERRORS.INVALID_FILE });
      throw new FileValidationError(ERRORS.INVALID_FILE);
    }

    await zip.extract(fileNames[0], extractedFileName);
    await zip.close();
  } catch (error) {
    if (error instanceof FileValidationError) {
      throw error;
    }

    throw new FileValidationError(ERRORS.INVALID_FILE);
  }

  return extractedFileName;
}

async function _getFilesToExtractName(zipStream) {
  const entries = await zipStream.entries();
  const fileNames = values(entries).map((entry) => entry.name);
  const validFiles = fileNames.filter((name) => VALID_FILE_NAME_REGEX.test(name));
  return validFiles;
}
