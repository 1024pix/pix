import { readFile } from 'node:fs/promises';
import * as url from 'node:url';

import { parseXml } from 'libxmljs2';

import { logErrorWithCorrelationIds } from '../../lib/infrastructure/monitoring-tools.js';
import { logger } from '../../src/shared/infrastructure/utils/logger.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

async function main(xmlPath) {
  logger.info('Starting script validate-cpf-xml');

  logger.trace(`Checking data file...`);
  const generatedCpfXml = await readFile(xmlPath, 'utf8');
  const cpfXsd = await readFile(`${__dirname}../../tests/unit/domain/services/cpf/cpf.xsd`, 'utf8');
  const parsedXmlToExport = parseXml(generatedCpfXml);
  const parsedXsd = parseXml(cpfXsd);

  parsedXmlToExport.validate(parsedXsd);

  if (parsedXmlToExport.validationErrors.length > 0) {
    const set = new Set();
    const extractMessage = ({ message }) =>
      message.replace(/Element '\{urn:cdc:cpf:pc5:schema:1.0.0\}(.*)'/, '$1').replace('\n', '');
    parsedXmlToExport.validationErrors.forEach((error) => set.add(extractMessage(error)));

    set.forEach((errorSet) => logErrorWithCorrelationIds(errorSet));

    logger.warn(`${parsedXmlToExport.validationErrors.length} erreurs dans le fichier`);
  }
  logger.info('✅ ');
}

(async () => {
  try {
    const xmlPath = process.argv[2];
    await main(xmlPath);
  } catch (error) {
    logErrorWithCorrelationIds(error);
    process.exitCode = 1;
  }
})();
