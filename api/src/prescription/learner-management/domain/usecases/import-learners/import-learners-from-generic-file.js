import { DomainTransaction } from '../../../../../shared/domain/DomainTransaction.js';
import { GenericParser } from '../../../infrastructure/serializers/csv/parsers/generic-parser.js';
import { AggregateImportError } from '../../errors.js';
import { ImportOrganizationLearnerSet } from '../../models/ImportOrganizationLearnerSet.js';

const importLearnersFromGenericFile = async function ({
  organizationImportId,
  organizationLearnerImportFormatRepository,
  organizationLearnerRepository,
  organizationLearnerFilterRepository,
  organizationImportRepository,
  importStorage,
}) {
  const errors = [];
  const organizationImport = await organizationImportRepository.get(organizationImportId);

  try {
    const organizationId = organizationImport.organizationId;
    const importFormat = await organizationLearnerImportFormatRepository.get(organizationId);

    const readableStream = await importStorage.readFile({ filename: organizationImport.filename });

    const parser = GenericParser.buildParser({ importFormat });

    const learnerSet = ImportOrganizationLearnerSet.buildSet({
      organizationId,
      importFormat,
    });

    for await (const learner of parser.parseStream({ readableStream, encoding: organizationImport.encoding })) {
      learnerSet.addLearner(learner);
    }

    learnerSet.throwIfErrors();

    const existingLearners = await organizationLearnerRepository.findAllCommonLearnersFromOrganizationId({
      organizationId,
    });

    learnerSet.setExistingLearners(existingLearners);

    const learners = learnerSet.learners;

    await DomainTransaction.execute(async () => {
      await organizationLearnerFilterRepository.deleteOrganizationLearnerFiltersFromOrganizationId(organizationId);
      await organizationLearnerRepository.disableCommonOrganizationLearnersFromOrganizationId({
        organizationId,
        excludeOrganizationLearnerIds: learners.existinglearnerIds,
      });
      await organizationLearnerRepository.saveCommonOrganizationLearners(learners.list);

      if (learnerSet.filtersAvailableValues.length > 0) {
        await organizationLearnerFilterRepository.saveOrganizationLearnerFilters(
          learnerSet.filtersAvailableValues.map((learnerFilter) => learnerFilter.dataToInsert),
        );
      }
    });
  } catch (error) {
    if (Array.isArray(error)) {
      errors.push(...error);
    } else {
      errors.push(error);
    }
    throw new AggregateImportError(errors);
  } finally {
    organizationImport.process({ errors });
    await organizationImportRepository.save(organizationImport);
    if (errors.length === 0) {
      await importStorage.deleteFile({ filename: organizationImport.filename });
    }
  }
};

export { importLearnersFromGenericFile };
