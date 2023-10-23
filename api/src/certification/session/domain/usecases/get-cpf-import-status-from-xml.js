import fs from 'fs';
import sax from 'sax';
import saxPath from 'saxpath';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';

import xml2js from 'xml2js';

import * as cpfCertificationResultRepository from '../../infrastructure/repositories/cpf-certification-result-repository.js';
import { CpfImportStatus } from '../../domain/models/CpfImportStatus.js';

const getCPfImportstatusFromXml = async ({ filePath }) => {
  const { cpfImportErrorIds, cpfImportSuccessIds } = await getCpfImportResults(filePath);

  if (cpfImportErrorIds.length) {
    await cpfCertificationResultRepository.updateCertificationImportStatus({
      certificationCourseIds: cpfImportErrorIds,
      cpfImportStatus: CpfImportStatus.ERROR,
    });
  }

  if (cpfImportSuccessIds.length) {
    await cpfCertificationResultRepository.updateCertificationImportStatus({
      certificationCourseIds: cpfImportSuccessIds,
      cpfImportStatus: CpfImportStatus.SUCCESS,
    });
  }

  logger.info(`${cpfImportErrorIds.length} certifications en erreur`);
  logger.info(`${cpfImportSuccessIds.length} certifications importées avec succès`);
};

function getCpfImportResults(filePath) {
  const xmlStream = fs.createReadStream(filePath);
  const saxStream = sax.createStream({
    strict: true,
  });
  return new Promise((resolve, reject) => {
    const cpfImportErrors = new saxPath.SaXPath(saxStream, '//passage');
    const cpfImportSuccess = new saxPath.SaXPath(saxStream, '//PassagesOK/idTechnique');

    const cpfImportErrorIds = [];
    const cpfImportSuccessIds = [];

    cpfImportErrors.on('match', (xmlNode) => {
      xml2js.parseString(xmlNode, async (err, { passage }) => {
        const [errorMessage] = passage['messageErreur'];
        const [certificationId] = passage.idTechnique;

        if (errorMessage.includes('existe déjà en base')) {
          cpfImportSuccessIds.push(certificationId);
        }
        if (errorMessage.includes('Aucun titulaire')) {
          cpfImportErrorIds.push(certificationId);
        }
      });
    });

    cpfImportSuccess.on('match', (xmlNode) => {
      xml2js.parseString(xmlNode, async (err, { idTechnique }) => {
        cpfImportSuccessIds.push(idTechnique);
      });
    });

    xmlStream
      .pipe(saxStream)
      .on('error', reject)
      .on('end', async () => {
        resolve({ cpfImportErrorIds, cpfImportSuccessIds });
      });
  });
}

export { getCPfImportstatusFromXml, getCpfImportResults };
