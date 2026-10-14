import { config } from '../../../config/config.js';
import * as networkAPI from '../../organizational-entities/application/api/network-api.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';
import { ScriptWithJob } from '../../shared/application/scripts/script-with-job.js';
import { DomainTransaction } from '../../shared/domain/DomainTransaction.js';
import { usecases } from '../learner-management/domain/usecases/index.js';
import * as organizationLearnerApi from '../organization-learner/application/api/organization-learners-api.js';

export class DeleteOrganizationLearnersFromNetworkScript extends ScriptWithJob {
  constructor() {
    super({
      description:
        'Deletes organization-learners and their participations for a given networkId and older than a given date',
      permanent: true,
      options: {
        networkId: {
          type: 'number',
          describe: 'an id from a single network',
          demandOption: true,
          coerce: Number,
        },
        lastActivityDate: {
          type: 'string',
          describe: 'Delete learners which activity is older than this date',
          demandOption: true,
        },
      },
    });
  }

  async handle({ options, logger, jobClient }) {
    // TODO : Rajouter des logs et un fonctionnement dryrun

    const engineeringUserId = config.infra.engineeringUserId;
    const lastActivityDate = new Date(options.lastActivityDate);
    const networkId = options.networkId;
    if (isNaN(lastActivityDate)) throw new Error('invalid lastActivityDate');

    const organizations = await networkAPI.findNetworkOrganizations({ networkId });
    if (organizations.length === 0) throw new Error('Network is empty');

    await super.handle({ jobClient });

    logger.info(`Delete learners from network ${networkId} with last activity prior to ${options.lastActivityDate}`);

    for (const { organizationId } of organizations) {
      await DomainTransaction.execute(async () => {
        const organizationLearnerIds = await organizationLearnerApi.findIdWithLastActivityDatePriorTo({
          organizationId,
          lastActivityDate,
        });

        const knexConn = DomainTransaction.getConnection();

        const combinedCourseOrganizationLearners = await knexConn('organization_learner_participations')
          .join(
            'view-active-organization-learners',
            'organization_learner_participations.organizationLearnerId',
            'view-active-organization-learners.id',
          )
          .where('type', 'COMBINED_COURSE')
          .where('organizationId', organizationId)
          .pluck('organizationLearnerId');

        const organizationLearnerIdsToDelete = organizationLearnerIds.filter(
          (id) => !combinedCourseOrganizationLearners.includes(id),
        );
        await usecases.deleteOrganizationLearners({
          organizationLearnerIds: organizationLearnerIdsToDelete,
          userId: engineeringUserId,
          organizationId,
          userRole: 'SUPER_ADMIN',
          client: 'SCRIPT',
        });
      });
    }
  }
}

await ScriptRunner.execute(import.meta.url, DeleteOrganizationLearnersFromNetworkScript);
