import * as combinedCourseApi from '../../../../quest/application/api/combined-course-api.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { Assessment } from '../../../../shared/domain/models/Assessment.js';
import { PromiseUtils } from '../../../../shared/infrastructure/utils/promise-utils.js';
import { CampaignTypes } from '../../../shared/domain/constants.ts';
import { CampaignParticipationForUserManagement } from '../../domain/models/CampaignParticipationForUserManagement.js';

const findByUserId = async function (userId) {
  const knexConnection = DomainTransaction.getConnection();

  const campaignParticipations = await knexConnection
    .with(
      'participations',
      knexConnection('assessments')
        .select({
          campaignParticipationId: 'campaign-participations.id',
          participantExternalId: 'campaign-participations.participantExternalId',
          status: 'campaign-participations.status',
          campaignId: 'campaigns.id',
          campaignCode: 'campaigns.code',
          createdAt: knexConnection.raw('COALESCE("campaign-participations"."createdAt", assessments."createdAt")'),
          sharedAt: 'campaign-participations.sharedAt',
          deletedAt: 'campaign-participations.deletedAt',
          updatedAt: 'assessments.updatedAt',
          organizationLearnerFirstName: 'view-active-organization-learners.firstName',
          organizationLearnerLastName: 'view-active-organization-learners.lastName',
        })
        .leftJoin('campaign-participations', 'assessments.campaignParticipationId', 'campaign-participations.id')
        .leftJoin('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
        .leftJoin(
          'view-active-organization-learners',
          'view-active-organization-learners.id',
          'campaign-participations.organizationLearnerId',
        )
        .where('assessments.userId', userId)
        .where('assessments.isImproving', false)
        .where('assessments.type', Assessment.types.CAMPAIGN)
        .union(function () {
          // using UNION will remove lines having the exact same attibutes
          this.select({
            campaignParticipationId: 'campaign-participations.id',
            participantExternalId: 'campaign-participations.participantExternalId',
            status: 'campaign-participations.status',
            campaignId: 'campaigns.id',
            campaignCode: 'campaigns.code',
            createdAt: 'campaign-participations.createdAt',
            sharedAt: 'campaign-participations.sharedAt',
            deletedAt: 'campaign-participations.deletedAt',
            updatedAt: 'campaign-participations.deletedAt',
            organizationLearnerFirstName: 'view-active-organization-learners.firstName',
            organizationLearnerLastName: 'view-active-organization-learners.lastName',
          })
            .from('campaign-participations')
            .leftJoin('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
            .leftJoin(
              'view-active-organization-learners',
              'view-active-organization-learners.id',
              'campaign-participations.organizationLearnerId',
            )
            .where({ 'campaign-participations.userId': userId, type: CampaignTypes.PROFILES_COLLECTION });
        }),
    )
    .select([
      'campaignParticipationId',
      'participantExternalId',
      'status',
      'campaignId',
      'campaignCode',
      'createdAt',
      'sharedAt',
      'deletedAt',
      'updatedAt',
      'organizationLearnerFirstName',
      'organizationLearnerLastName',
    ])
    .from('participations')
    .orderBy('createdAt', 'desc')
    .orderBy('campaignCode', 'asc')
    .orderBy('sharedAt', 'desc');

  return PromiseUtils.mapSeries(campaignParticipations, async (attributes) => {
    const participation = new CampaignParticipationForUserManagement(attributes);
    if (participation.campaignId) {
      const combinedCourseInfo = await combinedCourseApi.getByCampaignId(participation.campaignId);
      participation.setIsFromCombinedCourse(combinedCourseInfo !== null);
    }
    return participation;
  });
};

export { findByUserId };
