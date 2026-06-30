import { Script } from '../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';
import { DomainTransaction } from '../../shared/domain/DomainTransaction.js';
import { usecases } from '../learner-management/domain/usecases/index.js';

export class DeleteOrganizationLearnersFromOrganizationScript extends Script {
  constructor() {
    super({
      description: 'Deletes organization-learners and potentially anonymize them',
      permanent: true,
      options: {
        organizationId: {
          type: 'number',
          describe: 'an id from a single organization',
          demandOption: true,
          coerce: Number,
        },
        date: {
          type: 'string',
          describe: 'Delete learners which activity is older than this date, if undefined : delete all learners',
          demandOption: false,
        },
        executeAnonymization: {
          type: 'boolean',
          describe: 'Default true, set to false to delete without anonymizing',
          default: true,
          demandOption: false,
          coerce: Boolean,
        },
      },
    });
  }

  async handle({ options, logger }) {
    const date = options.date;
    const organizationId = options.organizationId;
    const executeAnonymization = options.executeAnonymization;

    if (date && isNaN(Date.parse(date))) {
      throw new Error("La date passée en paramètre n'est pas valide");
    }
    logger.info(`Delete learner from organization : ${options.organizationId}.`);
    if (date) {
      logger.info(`Delete learner before ${options.date}`);
    }
    logger.info(`Anonymized data : ${options.executeAnonymization}`);
    await DomainTransaction.execute(async () => {
      const engineeringUserId = process.env.ENGINEERING_USER_ID;

      let organizationLearnerToDeleteIds;

      if (date) {
        organizationLearnerToDeleteIds = await this.#getOrganizationLearnersToDeleteIds({ organizationId, date });

        await this.#deleteCampaignParticipations({ engineeringUserId, organizationId, date });
      } else {
        const knexConnection = DomainTransaction.getConnection();
        organizationLearnerToDeleteIds = await knexConnection('organization-learners')
          .where({ organizationId })
          .whereNull('deletedAt')
          .pluck('id');
      }

      await usecases.deleteOrganizationLearners({
        organizationLearnerIds: organizationLearnerToDeleteIds,
        userId: engineeringUserId,
        organizationId,
        userRole: 'SUPER_ADMIN',
        client: 'SCRIPT',
      });

      if (executeAnonymization) {
        const updatedAt = new Date();
        await this.#anonymizeOrganizationLearners({ organizationId });

        const campaignParticipations = await this.#anonymizeCampaignParticipations({ organizationId });
        const campaignParticipationsIds = campaignParticipations.map(
          (campaignParticipation) => campaignParticipation.id,
        );
        await this.#detachRecommendedTrainings({ campaignParticipationsIds, updatedAt });
        await this.#detachAssessmentFromCampaignParticipations({ campaignParticipations });
      }
    });
  }
  async #deleteCampaignParticipations({ engineeringUserId, organizationId, date }) {
    const knexConnection = DomainTransaction.getConnection();
    await knexConnection('campaign-participations')
      .update({
        deletedAt: new Date(),
        deletedBy: engineeringUserId,
      })
      .whereNull('deletedAt')
      .whereRaw('id IN (?)', [
        knexConnection('campaign-participations')
          .join('organization-learners', 'organization-learners.id', 'campaign-participations.organizationLearnerId')
          .where({ organizationId })
          .pluck('campaign-participations.id'),
      ])
      .andWhere('createdAt', '<=', date);
  }

  async #anonymizeOrganizationLearners({ organizationId }) {
    const knexConnection = DomainTransaction.getConnection();
    await knexConnection('organization-learners')
      .update({ firstName: '', lastName: '', userId: null, updatedAt: new Date() })
      .where({ organizationId })
      .whereNotNull('deletedAt');
  }

  #anonymizeCampaignParticipations({ organizationId }) {
    const knexConnection = DomainTransaction.getConnection();
    return knexConnection('campaign-participations')
      .update({ participantExternalId: null, userId: null })
      .whereRaw('id IN (?)', [
        knexConnection('campaign-participations')
          .join('organization-learners', 'organization-learners.id', 'campaign-participations.organizationLearnerId')
          .where({ organizationId })
          .whereNotNull('campaign-participations.deletedAt')
          .pluck('campaign-participations.id'),
      ])
      .returning('id');
  }

  async #detachAssessmentFromCampaignParticipations({ campaignParticipations }) {
    const knexConnection = DomainTransaction.getConnection();
    await knexConnection('assessments')
      .update({ campaignParticipationId: null, updatedAt: new Date() })
      .whereIn(
        'campaignParticipationId',
        campaignParticipations.map((campaignParticipation) => campaignParticipation.id),
      );
  }

  #getOrganizationLearnersToDeleteIds({ organizationId, date }) {
    const knexConnection = DomainTransaction.getConnection();
    return knexConnection('organization-learners')
      .select(['organization-learners.id'])
      .where({ organizationId })
      .whereNull('deletedAt')
      .whereRaw(`? <= ?`, [
        knexConnection('campaign-participations')
          .select('createdAt')
          .whereRaw('"organizationLearnerId" = "organization-learners"."id"')
          .orderBy('createdAt', 'desc')
          .limit(1),
        date,
      ])
      .pluck('organization-learners.id');
  }

  async #detachRecommendedTrainings({ campaignParticipationsIds, updatedAt }) {
    const knexConnection = DomainTransaction.getConnection();
    await knexConnection('user-recommended-trainings')
      .update({ campaignParticipationId: null, updatedAt })
      .whereIn('campaignParticipationId', campaignParticipationsIds);
  }
}

await ScriptRunner.execute(import.meta.url, DeleteOrganizationLearnersFromOrganizationScript);
