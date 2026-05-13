import { DomainTransaction } from '../../../../../shared/domain/DomainTransaction.js';
import { SupParser } from '../../../infrastructure/serializers/csv/parsers/sup-parser.js';
import { ValidateSupFileJob } from '../../models/jobs/ValidateSupFileJob.js';
import { OrganizationImportStatus } from '../../models/OrganizationImportStatus.js';

const uploadSupFile = async function ({
  payload,
  userId,
  organizationId,
  type,
  i18n,
  organizationImportRepository,
  validateSupFileJobRepository,
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

      const parserEncoding = await importStorage.getParser({ Parser: SupParser, filename }, organizationId, i18n);
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

  await validateSupFileJobRepository.performAsync(
    new ValidateSupFileJob({ organizationImportId, type, locale: i18n.getLocale() }),
  );
};

export { uploadSupFile };
