import _ from 'lodash';

import { Assessment } from '../../../../../src/school/domain/models/Assessment.js';
import { usecases } from '../../../../../src/school/domain/usecases/index.js';
import * as missionAssessmentRepository from '../../../../../src/school/infrastructure/repositories/mission-assessment-repository.js';
import * as assessmentRepository from '../../../../../src/shared/infrastructure/repositories/assessment-repository.js';
import { databaseBuilder, expect } from '../../../../test-helper.js';

describe('Integration | UseCase | getAssessmentById', function () {
  it('should return the missionAssessment corresponding to the assessmentId', async function () {
    const assessmentId = databaseBuilder.factory.buildPix1dAssessment().id;
    const missionAssessment = databaseBuilder.factory.buildMissionAssessment({ assessmentId });
    await databaseBuilder.commit();

    const result = await usecases.getAssessmentById({
      assessmentId,
      missionAssessmentRepository,
      assessmentRepository,
    });

    const expectedMissionAssessment = {
      id: assessmentId,
      organizationLearnerId: missionAssessment.organizationLearnerId,
      missionId: `${missionAssessment.missionId}`,
      state: Assessment.states.STARTED,
    };

    expect(_.pick(result, Object.keys(expectedMissionAssessment))).to.deep.equal(expectedMissionAssessment);
  });
});
