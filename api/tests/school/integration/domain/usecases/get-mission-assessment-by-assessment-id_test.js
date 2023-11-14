import { databaseBuilder, expect } from '../../../../test-helper.js';
import { usecases } from '../../../../../src/school/shared/usecases/index.js';
import { MissionAssessment } from '../../../../../src/school/domain/models/MissionAssessment.js';
import * as missionAssessmentRepository from '../../../../../src/school/infrastructure/repositories/mission-assessment-repository.js';

describe('Integration | UseCase | get-mission-assessment-by-assessment-id', function () {
  it('should return the missionAssessment corresponding to the assessmentId', async function () {
    const assessmentId = databaseBuilder.factory.buildPix1dAssessment().id;
    const missionAssessment = databaseBuilder.factory.buildMissionAssessment({ assessmentId });
    await databaseBuilder.commit();

    const expectedMissionAssessment = new MissionAssessment({
      assessmentId,
      organizationLearnerId: missionAssessment.organizationLearnerId,
      missionId: missionAssessment.missionId,
    });

    const result = await usecases.getMissionAssessmentByAssessmentId({ assessmentId, missionAssessmentRepository });

    expect(result).to.deep.equal(expectedMissionAssessment);
  });
});
