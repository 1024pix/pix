import _ from 'lodash';

import { knex } from '../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { Assessment } from '../../../shared/domain/models/Assessment.js';
import { MissionLearner } from '../../domain/models/MissionLearner.js';
import { MissionAssessment, MissionAssessmentResult } from '../models/mission-assessment.js';

const save = async function ({ missionAssessment }) {
  const knexConn = DomainTransaction.getConnection();
  await knexConn('mission-assessments').insert({ ...missionAssessment });
};

async function updateResult(assessmentId, result) {
  const knexConn = DomainTransaction.getConnection();
  const missionAssessmentResult = new MissionAssessmentResult(result);
  await knexConn('mission-assessments').update('result', missionAssessmentResult).where({ assessmentId });
}

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
      'mission-assessments.result',
    )
    .from('mission-assessments')
    .join('assessments', 'assessments.id', 'mission-assessments.assessmentId')
    .where({ missionId })
    .whereIn('mission-assessments.organizationLearnerId', organizationLearnerIds);

  return Object.entries(_.groupBy(organizationLearnerAssessments, 'organizationLearnerId'));
}

const _byDescendingCreatedAt = (assessmentA, assessmentB) => assessmentB.createdAt - assessmentA.createdAt;

const getStatusesForLearners = async function (missionId, organizationLearners) {
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
    const learner = new MissionLearner({
      ...organizationLearner,
      missionStatus: organizationLearnerInfo?.status ?? 'not-started',
      result: organizationLearnerInfo?.result,
    });
    decoratedMissionLearners.push(learner);
  }
  return decoratedMissionLearners;
};

const getMissionIdsByState = async function (organizationLearnerId) {
  const missionAssessments = await knex('mission-assessments')
    .select('mission-assessments.missionId', 'assessments.state', 'mission-assessments.createdAt')
    .join('assessments', 'assessments.id', 'mission-assessments.assessmentId')
    .join(
      knex
        .select('organizationLearnerId as learnerId', 'missionId')
        .max('createdAt', { as: 'date' })
        .from('mission-assessments')
        .groupBy('organizationLearnerId', 'missionId')
        .as('max_dates'),
      function () {
        this.on('mission-assessments.organizationLearnerId', '=', 'max_dates.learnerId')
          .andOn('mission-assessments.createdAt', '=', 'max_dates.date')
          .andOn('mission-assessments.missionId', '=', 'max_dates.missionId');
      },
    )
    .where({ organizationLearnerId });

  const missionIdsGroupByState = {};
  missionAssessments.forEach((missionAssessment) => {
    if (missionIdsGroupByState[missionAssessment.state]) {
      missionIdsGroupByState[missionAssessment.state].push(missionAssessment.missionId);
    } else {
      missionIdsGroupByState[missionAssessment.state] = [missionAssessment.missionId];
    }
  });
  return missionIdsGroupByState;
};

export { getByAssessmentId, getCurrent, getMissionIdsByState, getStatusesForLearners, save, updateResult };
