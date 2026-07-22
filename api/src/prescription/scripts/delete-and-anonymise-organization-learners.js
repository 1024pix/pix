import { knex } from '../../../db/knex-database-connection.js';
import { commaSeparatedNumberParser } from '../../shared/application/scripts/parsers.js';
import { Script } from '../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';
import { CLIENTS, PIX_ADMIN } from '../../shared/constants.js';
import { usecases } from '../learner-management/domain/usecases/index.js';
// Définition du script
export class DeleteAndAnonymiseOrganizationLearnerScript extends Script {
  constructor() {
    super({
      description: 'Deletes organization-learners and anonymise their related data',
      permanent: true,
      options: {
        organizationLearnerIds: {
          type: 'string',
          describe: 'a list of comma separated organization learner ids',
          demandOption: true,
          coerce: commaSeparatedNumberParser(),
        },
      },
    });
  }

  async handle({ options, logger }) {
    const engineeringUserId = process.env.ENGINEERING_USER_ID;

    logger.info(`Anonymize ${options.organizationLearnerIds.length} learners`);

    const organizationLearnerOfOrganizationIds = await knex('view-active-organization-learners')
      .select({
        organizationId: 'organizationId',
        organizationLearnerIds: knex.raw('array_agg("view-active-organization-learners".id)'),
      })
      .whereIn('id', options.organizationLearnerIds)
      .groupBy('organizationId');

    logger.info(`Anonymize learners from ${organizationLearnerOfOrganizationIds.length} organizations`);
    for (const organizationLearnerOfOrganizationId of organizationLearnerOfOrganizationIds) {
      logger.info(
        `START : Anonymize ${organizationLearnerOfOrganizationId.organizationLearnerIds.length} learners from organization :${organizationLearnerOfOrganizationId.organizationId}`,
      );
      await usecases.deleteOrganizationLearners({
        organizationLearnerIds: organizationLearnerOfOrganizationId.organizationLearnerIds,
        organizationId: organizationLearnerOfOrganizationId.organizationId,
        userId: engineeringUserId,
        userRole: PIX_ADMIN.ROLES.SUPER_ADMIN,
        client: CLIENTS.SCRIPT,
      });
      logger.info(
        `END : Anonymize ${organizationLearnerOfOrganizationId.organizationLearnerIds.length} learners from organization :${organizationLearnerOfOrganizationId.organizationId}`,
      );
    }
  }
}

await ScriptRunner.execute(import.meta.url, DeleteAndAnonymiseOrganizationLearnerScript);
