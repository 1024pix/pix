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
    const engineeringUserId = config.infra.engineeringUserId;
    const lastActivityDate = new Date(options.lastActivityDate);
    const networkId = options.networkId;
    if (isNaN(lastActivityDate)) throw new Error('invalid lastActivityDate');

    const organizations = await networkAPI.findNetworkOrganizations({ networkId });
    if (organizations.length === 0) throw new Error('Network is empty');

    await super.handle({ jobClient });

    logger.info(`Delete learners from network ${networkId} with last activity prior to ${options.lastActivityDate}`);

    // plan :
    // - Récupérer les prescrits des orgas
    // - Exclure les prescrit ayant participer à a des parcours combiné
    // - supprimer les prescrits dont la date de derniere activité est antétieur à la date donnée

    for (const { organizationId } of organizations) {
      await DomainTransaction.execute(async () => {
        const { organizationLearners } = await organizationLearnerApi.find({ organizationId });

        const organizationLearnerToDeleteIds = organizationLearners.map(({ id }) => id);
        await usecases.deleteOrganizationLearners({
          organizationLearnerIds: organizationLearnerToDeleteIds,
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
