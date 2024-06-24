import _ from 'lodash';

import { knex } from '../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { Assessment } from '../../../shared/domain/models/Assessment.js';
import { MissionAssessment } from '../models/mission-assessment.js';

const save = async function ({ missionAssessment, domainTransaction = DomainTransaction.emptyTransaction() }) {
  const knexConnection = domainTransaction.knexTransaction || knex;
  await knexConnection('mission-assessments').insert({ ...missionAssessment });
};

const getByAssessmentId = async function (assessmentId, domainTransaction = DomainTransaction.emptyTransaction()) {
  const knexConnection = domainTransaction.knexTransaction || knex;
  const rawAssessmentMission = await knexConnection('mission-assessments')
    .where({ assessmentId: assessmentId })
    .returning('*')
    .first();
  return new MissionAssessment({ ...rawAssessmentMission });
};

const getCurrent = async function (missionId, organizationLearnerId) {
  const rawAssessmentMission = await knex('mission-assessments')
    .join('assessments', 'assessments.id', 'mission-assessments.assessmentId')
    .where({ missionId, organizationLearnerId, state: Assessment.states.STARTED })
    .first();

  if (!rawAssessmentMission) {
    return null;
  }

  return new MissionAssessment({ ...rawAssessmentMission });
};

const getStatusesForLearners = async function (missionId, organizationLearners, decorateMissionLearnerWithStatus) {
  const organizationLearnerIds = organizationLearners.map((learner) => learner.id);
  const organizationLearnerStatuses = await knex
    .select(
      'mission-assessments.organizationLearnerId',
      'assessments.state as status',
      'assessments.id as  assessmentId',
    )
    .from('mission-assessments')
    .join('assessments', 'assessments.id', 'mission-assessments.assessmentId')
    .join(
      knex
        .select('organizationLearnerId')
        .max('createdAt', { as: 'date' })
        .from('mission-assessments')
        .groupBy('organizationLearnerId')
        .as('max_dates'),
      function () {
        this.on('mission-assessments.organizationLearnerId', '=', 'max_dates.organizationLearnerId').andOn(
          'mission-assessments.createdAt',
          '=',
          'max_dates.date',
        );
      },
    )
    .where({ missionId })
    .whereIn('mission-assessments.organizationLearnerId', organizationLearnerIds);

  const decoratedMissionLearners = [];
  const organizationLearnerStatusesByLearnerId = _.groupBy(organizationLearnerStatuses, 'organizationLearnerId');
  for (const organizationLearner of organizationLearners) {
    const [organizationLearnerInfo] = organizationLearnerStatusesByLearnerId[`${organizationLearner.id}`] ?? [];
    const learner = await decorateMissionLearnerWithStatus(
      organizationLearner,
      organizationLearnerInfo?.status,
      organizationLearnerInfo?.assessmentId,
    );
    decoratedMissionLearners.push(learner);
  }
  return decoratedMissionLearners;
};

const getAllCompletedMissionIds = async function (organizationLearnerId) {
  const raw = await knex('mission-assessments')
    .select('mission-assessments.missionId')
    .join('assessments', 'assessments.id', 'mission-assessments.assessmentId')
    .where({ organizationLearnerId })
    .andWhere({ state: Assessment.states.COMPLETED });

  return raw.map((element) => element.missionId);
};

export { getAllCompletedMissionIds, getByAssessmentId, getCurrent, getStatusesForLearners, save };
