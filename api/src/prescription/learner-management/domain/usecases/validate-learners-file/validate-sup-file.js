import { AggregateImportError } from '../../errors.js';
import { ImportFromSupJob } from '../../models/jobs/ImportFromSupJob.js';

const validateSupFile = async function ({
  Parser,
  organizationImportId,
  i18n,
  type,
  importFromSupJobRepository,
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

  await importFromSupJobRepository.performAsync(
    new ImportFromSupJob({
      organizationImportId: organizationImport.id,
      type,
      locale: i18n.getLocale(),
    }),
  );
};

export { validateSupFile };
