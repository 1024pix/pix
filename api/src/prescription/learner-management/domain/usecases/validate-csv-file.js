import { AggregateImportError } from '../errors.js';

const validateCsvFile = async function ({ Parser, organizationId, i18n, organizationImportRepository, importStorage }) {
  const organizationImport = await organizationImportRepository.getLastByOrganizationId(organizationId);
  const errors = [];
  let warningsData;

  try {
    const parser = await importStorage.getParser(
      { Parser, filename: organizationImport.filename },
      organizationId,
      i18n,
    );

    const { warnings } = parser.parse(parser.getFileEncoding());

    warningsData = warnings;
  } catch (error) {
    if (error instanceof AggregateImportError) {
      errors.push(...error.meta);
    } else {
      errors.push(error);
    }
    throw error;
  } finally {
    organizationImport.validate({ errors, warnings: warningsData });
    await organizationImportRepository.save(organizationImport);
  }
};

export { validateCsvFile };
