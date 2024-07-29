import _ from 'lodash';

import { knex } from '../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { Assessment } from '../../../shared/domain/models/Assessment.js';
import { MissionAssessment } from '../models/mission-assessment.js';

const save = async function ({ missionAssessment }) {
  const knexConn = DomainTransaction.getConnection();
  await knexConn('mission-assessments').insert({ ...missionAssessment });
};

const getByAssessmentId = async function (assessmentId) {
  const knexConn = DomainTransaction.getConnection();
  const rawAssessmentMission = await knexConn('mission-assessments')
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

async function _getMissionAssessmentsByLearnerId(missionId, organizationLearnerIds) {
  const organizationLearnerAssessments = await knex
    .select(
      'mission-assessments.organizationLearnerId',
      'assessments.state as status',
      'assessments.id as assessmentId',
      'assessments.createdAt as createdAt',
    )
    .from('mission-assessments')
    .join('assessments', 'assessments.id', 'mission-assessments.assessmentId')
    .where({ missionId })
    .whereIn('mission-assessments.organizationLearnerId', organizationLearnerIds);

  return Object.entries(_.groupBy(organizationLearnerAssessments, 'organizationLearnerId'));
}

const _byDescendingCreatedAt = (assessmentA, assessmentB) => assessmentB.createdAt - assessmentA.createdAt;

const getStatusesForLearners = async function (missionId, organizationLearners, decorateMissionLearnerWithStatus) {
  const organizationLearnerIds = organizationLearners.map((learner) => learner.id);
  const missionAssessmentsByLearnerId = await _getMissionAssessmentsByLearnerId(missionId, organizationLearnerIds);

  const lastRelevantAssessments = missionAssessmentsByLearnerId.map(([_organizationLearnerId, assessments]) => {
    if (assessments.length > 1) {
      return assessments.filter((assessment) => assessment.status === 'completed').sort(_byDescendingCreatedAt)[0];
    }
    return assessments[0];
  });

  const decoratedMissionLearners = [];
  const lastRelevantAssessmentByLearnerId = _.groupBy(lastRelevantAssessments, 'organizationLearnerId');
  for (const organizationLearner of organizationLearners) {
    const [organizationLearnerInfo] = lastRelevantAssessmentByLearnerId[`${organizationLearner.id}`] ?? [];
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
