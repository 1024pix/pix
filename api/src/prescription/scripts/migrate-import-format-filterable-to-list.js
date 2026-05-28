import { commaSeparatedStringParser } from '../../shared/application/scripts/parsers.js';
import { Script } from '../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';
import { ORGANIZATION_FEATURE } from '../../shared/domain/constants.js';
import { DomainTransaction } from '../../shared/domain/DomainTransaction.js';
import { CommonOrganizationLearnerFilter } from '../learner-management/domain/models/CommonOrganizationLearnerFilter.js';

export class MigrateImportFormatFilterableToList extends Script {
  constructor() {
    super({
      description:
        'Migrate organization-learner-import-formats headers with filterable.type === "string" to "list", and backfill organization_learner_filters from existing imported learners.',
      permanent: false,
      options: {
        names: {
          type: 'string',
          describe: 'Comma-separated names of organization-learner-import-formats to migrate (e.g. "ONDE")',
          demandOption: true,
          coerce: commaSeparatedStringParser(),
        },
        dryRun: {
          type: 'boolean',
          describe: 'Run the script without persisting changes',
          default: true,
        },
      },
    });
  }

  async handle({ options, logger }) {
    await DomainTransaction.execute(async () => {
      const knexConn = DomainTransaction.getConnection();
      logger.info(`BEGIN: Migrate filterable string→list for formats [${options.names.join(', ')}]`);

      try {
        for (const formatName of options.names) {
          await migrateFormatByName({ formatName, logger });
        }

        if (options.dryRun) {
          await knexConn.rollback();
          logger.info(`ROLLBACK due to dryRun. Pass --dryRun false to persist changes.`);
          return;
        }

        logger.info(`COMMIT: Migration done for formats [${options.names.join(', ')}]`);
      } catch (error) {
        await knexConn.rollback();
        logger.error({ error }, `ROLLBACK: Migration failed`);
        throw error;
      }
    });
  }
}

async function migrateFormatByName({ formatName, logger }) {
  const knexConn = DomainTransaction.getConnection();

  const importFormat = await knexConn('organization-learner-import-formats').where({ name: formatName }).first();

  if (!importFormat) {
    logger.warn(`Format "${formatName}" not found, skipped.`);
    return;
  }

  const migratedHeaderNames = [];
  const newConfig = {
    ...importFormat.config,
    headers: importFormat.config.headers.map((header) => {
      if (header?.config?.displayable?.filterable?.type !== 'string') return header;

      migratedHeaderNames.push(header.name);
      return {
        ...header,
        config: {
          ...header.config,
          displayable: {
            ...header.config.displayable,
            filterable: { ...header.config.displayable.filterable, type: 'list' },
          },
        },
      };
    }),
  };

  if (migratedHeaderNames.length === 0) {
    logger.info(`Format "${formatName}" has no filterable.type === "string", nothing to migrate.`);
    return;
  }

  await knexConn('organization-learner-import-formats')
    .where({ id: importFormat.id })
    .update({ config: newConfig, updatedAt: new Date() });

  logger.info(
    `Format "${formatName}" (id=${importFormat.id}): updated headers [${migratedHeaderNames.join(', ')}] to filterable.type="list"`,
  );

  const newListHeaders = newConfig.headers.filter(
    (header) => migratedHeaderNames.includes(header.name) && header.config?.displayable?.filterable?.type === 'list',
  );

  const organizationIds = await findOrganizationIdsUsingFormat(importFormat.id);
  logger.info(`Format "${formatName}": ${organizationIds.length} organization(s) to backfill.`);

  for (const organizationId of organizationIds) {
    await insertFiltersForOrganization({ organizationId, headers: newListHeaders, logger });
  }
}

async function findOrganizationIdsUsingFormat(importFormatId) {
  const knexConn = DomainTransaction.getConnection();

  const rows = await knexConn('organization-features')
    .select('organization-features.organizationId')
    .join('features', 'features.id', 'organization-features.featureId')
    .where('features.key', ORGANIZATION_FEATURE.LEARNER_IMPORT.key)
    .whereJsonSupersetOf('organization-features.params', { organizationLearnerImportFormatId: importFormatId });

  return rows.map((row) => row.organizationId);
}

async function insertFiltersForOrganization({ organizationId, headers, logger }) {
  const knexConn = DomainTransaction.getConnection();

  const learners = await knexConn('view-active-organization-learners').select('attributes').where({ organizationId });

  if (learners.length === 0) {
    logger.info(`Organization ${organizationId}: no learners, skipping filters backfill.`);
    return;
  }

  const filters = headers
    .map((header) => {
      const key = header.config?.property ?? header.config?.mappingColumn ?? header.name;
      const isProperty = Boolean(header.config?.property);
      const attributeName = header.config.displayable.name;

      const values = [
        ...new Set(
          learners.map((learner) => (isProperty ? learner[key] : learner.attributes?.[key])).filter((v) => v != null),
        ),
      ];

      return new CommonOrganizationLearnerFilter({ organizationId, attributeName, values });
    })
    .filter((filter) => filter.values.length > 0);

  await knexConn('organization_learner_filters').where({ organization_id: organizationId }).del();

  if (filters.length === 0) {
    logger.info(`Organization ${organizationId}: no filter values found, table cleared.`);
    return;
  }

  await knexConn.batchInsert(
    'organization_learner_filters',
    filters.map((filter) => filter.dataToInsert),
  );

  logger.info(
    `Organization ${organizationId}: inserted ${filters.length} filter(s) [${filters.map((f) => f.attributeName).join(', ')}]`,
  );
}

await ScriptRunner.execute(import.meta.url, MigrateImportFormatFilterableToList);
