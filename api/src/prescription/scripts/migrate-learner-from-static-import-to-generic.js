import { Script } from '../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';
import { DomainTransaction } from '../../shared/domain/DomainTransaction.js';
import { batchUpdate } from '../../shared/infrastructure/utils/knex-utils.js';

export class MigrateLearnerFromStaticImportToGeneric extends Script {
  constructor() {
    super({
      description: 'Migrate learner from organization list to generic import',
      permanent: false,
      options: {
        typology: {
          type: 'string',
          describe: 'update learner from specific organization',
          choices: ['SCO', 'SUP', 'AGRI'],
          required: true,
          requiresArg: true,
        },
        dryRun: {
          type: 'boolean',
          describe: 'Run the script without making any database changes',
          default: true,
        },
      },
    });
  }

  async handle({ options, logger }) {
    await DomainTransaction.execute(async () => {
      logger.info(
        `BEGIN: Migrate learners to generic import data for organizations managing student of type : ${options.typology}`,
      );
      const knexConn = DomainTransaction.getConnection();

      try {
        const organizationLearners = await findOrganizationLearnersToMigrate(options.typology);

        logger.info(`learners to process : ${organizationLearners.length}.`);

        const isSUP = options.typology === 'SUP';

        const rows = organizationLearners.map((learner) => {
          if (!isSUP) {
            return {
              id: learner.id,
              attributes: {
                ...learner.attributes,
                middleName: learner.middleName ?? null,
                thirdName: learner.thirdName ?? null,
                preferredLastName: learner.preferredLastName ?? null,
                sex: learner.sex ?? null,
                nationalStudentId: learner.nationalStudentId ?? learner.nationalApprenticeId ?? null,
                birthCity: learner.birthCity ?? null,
                birthCityCode: learner.birthCityCode ?? null,
                birthCountryCode: learner.birthCountryCode ?? null,
                birthProvinceCode: learner.birthProvinceCode ?? null,
                MEFCode: learner.MEFCode ?? null,
                status: learner.status ?? null,
                division: learner.division ?? null,
                birthdate: learner.birthdate ?? null,
              },
            };
          } else {
            return {
              id: learner.id,
              attributes: {
                ...learner.attributes,
                middleName: learner.middleName ?? null,
                thirdName: learner.thirdName ?? null,
                preferredLastName: learner.preferredLastName ?? null,
                birthdate: learner.birthdate ?? null,
                studentNumber: learner.studentNumber ?? null,
                department: learner.department ?? null,
                email: learner.email ?? null,
                educationalTeam: learner.educationalTeam ?? null,
                group: learner.group ?? null,
                diploma: learner.diploma ?? null,
                status: learner.status ?? null,
              },
            };
          }
        });

        await batchUpdate({ tableName: 'organization-learners', primaryKeyName: 'id', rows });

        if (options.dryRun) {
          await knexConn.rollback();
          logger.info(
            `ROLLBACK: Migrate learners to generic import data for organizations managing student of type : ${options.typology}`,
          );
          logger.info(`--dryRun false to persist changes`);
          return;
        }

        logger.info(`COMMIT: Migrate learners to generic import data`);
      } catch (error) {
        await knexConn.rollback();
        logger.error(
          { error },
          `ERROR: Migrate learners to generic import data for organizations managing student of type : ${options.typology}`,
        );
        throw error;
      }
    });
  }
}

export function findOrganizationLearnersToMigrate(typology) {
  const knexConn = DomainTransaction.getConnection();

  const type = typology === 'SUP' ? 'SUP' : 'SCO';

  const query = knexConn('organization-learners')
    .select('organization-learners.*')
    .where((builder) => {
      // migrate learners not yet migrated: `attributes` is either NULL or only holds a
      // `schoolYear` value (e.g. `{"schoolYear": 2025}`) coming from SIECLE/FREGATA import
      builder
        .whereNull('organization-learners.attributes')
        .orWhereRaw(
          `jsonb_typeof("organization-learners"."attributes") = 'object' AND "organization-learners"."attributes" - 'schoolYear' = '{}'::jsonb`,
        );
    })
    .whereIn(
      'organization-learners.organizationId',
      knexConn('organizations').select('id').where({ type, isManagingStudents: true }),
    );

  if (typology === 'AGRI') {
    query.join('organization-tags', function () {
      this.on('organization-tags.organizationId', 'organization-learners.organizationId').andOnVal(
        'organization-tags.tagId',
        knexConn('tags').select('id').where('name', 'AGRICULTURE'),
      );
    });
  }

  if (typology === 'SCO') {
    query.whereNotExists(function () {
      this.select('organization-tags.organizationId')
        .from('organization-tags')
        .join('tags', 'tags.id', 'organization-tags.tagId')
        .whereRaw('"organization-tags"."organizationId" = "organization-learners"."organizationId"')
        .where('tags.name', 'AGRICULTURE');
    });
  }

  return query.groupBy('organization-learners.id');
}

await ScriptRunner.execute(import.meta.url, MigrateLearnerFromStaticImportToGeneric);
