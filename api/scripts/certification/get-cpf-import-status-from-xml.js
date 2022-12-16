const fs = require('fs');
const sax = require('sax');
const saxPath = require('saxpath');
const logger = require('../../lib/infrastructure/logger');

const xml2js = require('xml2js');

const { disconnect } = require('../../db/knex-database-connection');
const cpfCertificationResultRepository = require('../../lib/infrastructure/repositories/cpf-certification-result-repository');
const { cpfImportStatus } = require('../../lib/domain/models/CertificationCourse');

const isLaunchedFromCommandLine = require.main === module;

async function main(path) {
  logger.info("Récupération des résultats d'import CPF...");
  const filePath = path || process.argv[2];

  const { cpfImportErrorIds, cpfImportSuccessIds } = await getCpfImportResults(filePath);

  if (cpfImportErrorIds.length) {
    await cpfCertificationResultRepository.updateCertificationImportStatus({
      certificationCourseIds: cpfImportErrorIds,
      cpfImportStatus: cpfImportStatus.ERROR,
    });
  }

  if (cpfImportSuccessIds.length) {
    await cpfCertificationResultRepository.updateCertificationImportStatus({
      certificationCourseIds: cpfImportSuccessIds,
      cpfImportStatus: cpfImportStatus.SUCCESS,
    });
  }

  logger.info(`${cpfImportErrorIds.length} certifications en erreur`);
  logger.info(`${cpfImportSuccessIds.length} certifications importées avec succès`);
  logger.info(`Done! ...`);
}

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await main();
    } catch (error) {
      console.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

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

module.exports = {
  getCpfImportResults,
  main,
};
