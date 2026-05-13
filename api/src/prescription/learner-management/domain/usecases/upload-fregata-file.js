import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { ValidateFregataFileJob } from '../models/jobs/ValidateFregataFileJob.js';
import { OrganizationImportStatus } from '../models/OrganizationImportStatus.js';
import { FregataParser } from '../../infrastructure/serializers/csv/parsers/fregata-parser.js';

const uploadFregataFile = async function ({
  payload,
  userId,
  organizationId,
  i18n,
  organizationImportRepository,
  validateFregataFileJobRepository,
  importStorage,
}) {
  const organizationImportId = await DomainTransaction.execute(async () => {
    const organizationImportInstance = OrganizationImportStatus.create({ organizationId, createdBy: userId });
    await organizationImportRepository.save(organizationImportInstance);

    const organizationImport = await organizationImportRepository.getLastByOrganizationId(organizationId);

    let filename;
    let encoding;
    const errors = [];

    try {
      filename = await importStorage.sendFile({ filepath: payload.path });

      const parserEncoding = await importStorage.getParser({ Parser: FregataParser, filename }, organizationId, i18n);
      encoding = parserEncoding.getFileEncoding();

      return organizationImport.id;
    } catch (error) {
      errors.push(error);
      throw error;
    } finally {
      organizationImport.upload({ filename, encoding, errors });
      await organizationImportRepository.save(organizationImport);
    }
  });

  await validateFregataFileJobRepository.performAsync(
    new ValidateFregataFileJob({ organizationImportId, locale: i18n.getLocale() }),
  );
};

export { uploadFregataFile };
