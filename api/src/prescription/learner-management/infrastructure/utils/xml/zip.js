import _ from 'lodash';
const { isObject, values } = _;
import fs from 'fs';
const fsPromises = fs.promises;
import Path from 'path';
import os from 'os';
import StreamZip from 'node-stream-zip';
import { fileTypeFromFile } from 'file-type';

import { FileValidationError } from '../../../../../../lib/domain/errors.js';
import { logErrorWithCorrelationIds } from '../../../../../../lib/infrastructure/monitoring-tools.js';

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
  const extractedFileName = Path.join(directory, 'organization-learners.xml');
  const zip = new StreamZip.async({ file: path });
  const fileName = await _getFileToExtractName(zip);
  try {
    await zip.extract(fileName, extractedFileName);
  } catch (error) {
    throw new FileValidationError(ERRORS.INVALID_FILE);
  }
  await zip.close();
  return extractedFileName;
}

async function _getFileToExtractName(zipStream) {
  const entries = await zipStream.entries();
  const fileNames = values(entries).map((entry) => entry.name);
  const validFiles = fileNames.filter((name) => VALID_FILE_NAME_REGEX.test(name));
  if (validFiles.length != 1) {
    zipStream.close();
    logErrorWithCorrelationIds({ ERROR: ERRORS.INVALID_FILE, entries });
    throw new FileValidationError(ERRORS.INVALID_FILE);
  }
  return validFiles[0];
}
