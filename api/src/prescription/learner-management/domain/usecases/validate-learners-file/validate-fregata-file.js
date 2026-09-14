import { AggregateImportError } from '../../errors.js';
import { ImportFromFregataJob } from '../../models/jobs/ImportFromFregataJob.js';

const validateFregataFile = async function ({
  Parser,
  organizationImportId,
  i18n,
  importFromFregataJobRepository,
  organizationImportRepository,
  importStorage,
}) {
  const organizationImport = await organizationImportRepository.get(organizationImportId);
  const errors = [];
  let warningsData;

  try {
    const parser = await importStorage.getParser(
      { Parser, filename: organizationImport.filename },
      organizationImport.organizationId,
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

    await importStorage.deleteFile({ filename: organizationImport.filename });

    throw error;
  } finally {
    organizationImport.validate({ errors, warnings: warningsData });
    await organizationImportRepository.save(organizationImport);
  }

  await importFromFregataJobRepository.performAsync(
    new ImportFromFregataJob({
      organizationImportId: organizationImport.id,
      locale: i18n.getLocale(),
    }),
  );
};

export { validateFregataFile };
