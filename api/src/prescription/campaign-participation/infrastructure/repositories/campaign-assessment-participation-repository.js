import _ from 'lodash';

import { knex } from '../../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { Assessment } from '../../../../shared/domain/models/Assessment.js';
import * as knowledgeElementRepository from '../../../../shared/infrastructure/repositories/knowledge-element-repository.js';
import * as campaignRepository from '../../../campaign/infrastructure/repositories/campaign-repository.js';
import { CampaignAssessmentParticipation } from '../../domain/models/CampaignAssessmentParticipation.js';
import { DetachedAssessment } from '../../domain/read-models/DetachedAssessment.js';

const getByCampaignIdAndCampaignParticipationId = async function ({
  campaignId,
  campaignParticipationId,
  shouldBuildProgression = true,
}) {
  const result = await _fetchCampaignAssessmentAttributesFromCampaignParticipation(campaignId, campaignParticipationId);

  return _buildCampaignAssessmentParticipation(result, shouldBuildProgression);
};

const getDetachedByUserId = async ({ userId }) => {
  const knexConn = DomainTransaction.getConnection();
  const result = await knexConn('assessments')
    .select(['id', 'state', 'updatedAt'])
    .whereNull('campaignParticipationId')
    .where({ userId, type: Assessment.types.CAMPAIGN })
    .orderBy('updatedAt', 'DESC');

  return result.map((row) => new DetachedAssessment(row));
};

export { getByCampaignIdAndCampaignParticipationId, getDetachedByUserId };

async function _fetchCampaignAssessmentAttributesFromCampaignParticipation(campaignId, campaignParticipationId) {
  const knexConn = DomainTransaction.getConnection();
  const [campaignAssessmentParticipation] = await knexConn
    .with('campaignAssessmentParticipation', (qb) => {
      qb.select([
        'campaign-participations.userId',
        'view-active-organization-learners.firstName',
        'view-active-organization-learners.lastName',
        'campaign-participations.id AS campaignParticipationId',
        'campaign-participations.campaignId',
        'campaign-participations.createdAt',
        'campaign-participations.sharedAt',
        'campaign-participations.status',
        'campaign-participations.participantExternalId',
        'campaign-participations.masteryRate',
        'campaign-participations.validatedSkillsCount',
        'view-active-organization-learners.id AS organizationLearnerId',
        'assessments.state AS assessmentState',
        _assessmentRankByCreationDate(),
      ])
        .from('campaign-participations')
        .join('assessments', 'assessments.campaignParticipationId', 'campaign-participations.id')
        .join(
          'view-active-organization-learners',
          'view-active-organization-learners.id',
          'campaign-participations.organizationLearnerId',
        )
        .where({
          'campaign-participations.id': campaignParticipationId,
          'campaign-participations.campaignId': campaignId,
          'campaign-participations.deletedAt': null,
        });
    })
    .from('campaignAssessmentParticipation')
    .where({ rank: 1 });

  if (campaignAssessmentParticipation == null) {
    throw new NotFoundError(`There is no campaign participation with the id "${campaignParticipationId}"`);
  }

  return campaignAssessmentParticipation;
}

function _assessmentRankByCreationDate() {
  return knex.raw('ROW_NUMBER() OVER (PARTITION BY ?? ORDER BY ?? DESC) AS rank', [
    'assessments.campaignParticipationId',
    'assessments.createdAt',
  ]);
}

async function _buildCampaignAssessmentParticipation(result, shouldBuildProgression) {
  let targetedSkillsCount,
    testedSkillsCount = null;

  if (shouldBuildProgression) {
    const userSkills = await _setSkillsCount(result);
    targetedSkillsCount = userSkills.targetedSkillsCount;
    testedSkillsCount = userSkills.testedSkillsCount;
  }

  return new CampaignAssessmentParticipation({
    ...result,
    targetedSkillsCount,
    testedSkillsCount,
  });
}

async function _setSkillsCount(result) {
  let targetedSkillsCount = 0;
  let testedSkillsCount = 0;

  if (result.assessmentState !== Assessment.states.COMPLETED) {
    const operativeSkillIds = await campaignRepository.findSkillIds({ campaignId: result.campaignId });

    const knowledgeElementsByUser = await knowledgeElementRepository.findAssessedByUserIdAndLimitDateQuery({
      userId: result.userId,
      limitDate: result.sharedAt,
    });

    targetedSkillsCount = operativeSkillIds.length;
    testedSkillsCount = _getTestedSkillsCount(operativeSkillIds, knowledgeElementsByUser);
  }

  return { targetedSkillsCount, testedSkillsCount };
}

function _getTestedSkillsCount(skillIds, knowledgeElements) {
  const testedKnowledgeElements = _.filter(
    knowledgeElements,
    (knowledgeElement) => knowledgeElement.isValidated || knowledgeElement.isInvalidated,
  );
  const testedSkillIds = _.map(testedKnowledgeElements, 'skillId');
  const testedTargetedSkillIdsByUser = _.intersection(testedSkillIds, skillIds);

  return testedTargetedSkillIdsByUser.length;
}
