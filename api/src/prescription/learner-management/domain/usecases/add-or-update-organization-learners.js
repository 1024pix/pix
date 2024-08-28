import bluebird from 'bluebird';
import lodash from 'lodash';

import { DomainTransaction } from '../../../../../lib/infrastructure/DomainTransaction.js';
import { ORGANIZATION_LEARNER_CHUNK_SIZE } from '../../../../shared/infrastructure/constants.js';
import { SiecleParser } from '../../infrastructure/serializers/xml/siecle-parser.js';
import { SiecleFileStreamer } from '../../infrastructure/utils/xml/siecle-file-streamer.js';
import { loggerForImport } from '../../utils/loggerForImport.js';

const { chunk } = lodash;

async function addOrUpdateOrganizationLearners({
  organizationImportId,
  organizationLearnerRepository,
  organizationImportRepository,
  importStorage,
  chunkSize = ORGANIZATION_LEARNER_CHUNK_SIZE,
  logErrorWithCorrelationIds,
}) {
  const errors = [];
  const organizationImport = await organizationImportRepository.get(organizationImportId);

  return DomainTransaction.execute(async () => {
    loggerForImport('IMPORT_LOG -> <<addOrUpdateOrganizationLearners>> Debut du usecase');
    try {
      const readableStream = await importStorage.readFile({ filename: organizationImport.filename });
      loggerForImport('IMPORT_LOG -> <<addOrUpdateOrganizationLearners>> Apres readableStream');

      const siecleFileStreamer = await SiecleFileStreamer.create(readableStream, organizationImport.encoding);
      loggerForImport('IMPORT_LOG -> <<addOrUpdateOrganizationLearners>> Apres le siecleFileStreamer');

      const parser = SiecleParser.create(siecleFileStreamer);
      loggerForImport('IMPORT_LOG -> <<addOrUpdateOrganizationLearners>> Aprés le parser');

      const organizationLearnerData = await parser.parse();
      loggerForImport('IMPORT_LOG -> <<addOrUpdateOrganizationLearners>> Recuperation des OL datas');

      const organizationLearnersChunks = chunk(organizationLearnerData, chunkSize);

      const nationalStudentIdData = organizationLearnerData.map((learner) => learner.nationalStudentId);
      loggerForImport('IMPORT_LOG -> <<addOrUpdateOrganizationLearners>> Recuperation des nationalStudentId');

      await organizationLearnerRepository.disableAllOrganizationLearnersInOrganization({
        organizationId: organizationImport.organizationId,
        nationalStudentIds: nationalStudentIdData,
      });
      loggerForImport(
        'IMPORT_LOG -> <<addOrUpdateOrganizationLearners>> Aprés la methode disableAllOrganizationLearnersInOrganization',
      );

      await bluebird.mapSeries(organizationLearnersChunks, (chunk) => {
        return organizationLearnerRepository.addOrUpdateOrganizationOfOrganizationLearners(
          chunk,
          organizationImport.organizationId,
        );
      });
      loggerForImport(
        'IMPORT_LOG -> <<addOrUpdateOrganizationLearners>> Aprés la methode addOrUpdateOrganizationOfOrganizationLearners',
      );
    } catch (error) {
      errors.push(error);
      throw error;
    } finally {
      loggerForImport('IMPORT_LOG -> <<addOrUpdateOrganizationLearners>> Debut du finally');

      organizationImport.process({ errors });
      await organizationImportRepository.save(organizationImport);
      loggerForImport("IMPORT_LOG -> <<addOrUpdateOrganizationLearners>> Aprés le save de l'organizationImport");

      try {
        await importStorage.deleteFile({ filename: organizationImport.filename });
      } catch (e) {
        logErrorWithCorrelationIds(e);
      }
      loggerForImport('IMPORT_LOG -> <<addOrUpdateOrganizationLearners>> Fin du usecase');
    }
  });
}

export { addOrUpdateOrganizationLearners };
