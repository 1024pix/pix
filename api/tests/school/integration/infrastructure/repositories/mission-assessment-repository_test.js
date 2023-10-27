import { databaseBuilder, expect } from '../../../../test-helper.js';
import * as missionAssessmentRepository from '../../../../../src/school/infrastructure/repositories/mission-assessment-repository.js';
import { MissionAssessment } from '../../../../../src/school/domain/models/MissionAssessment.js';

describe('Integration | Repository | mission-assessment-repository', function () {
  describe('#getByAssessmentId', function () {
    it('returns the missionAssessment corresponding to the assessmentId', async function () {
      const missionId = 'flute78';
      const assessmentId = databaseBuilder.factory.buildPix1dAssessment({ missionId }).id;
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner().id;
      databaseBuilder.factory.buildMissionAssessment({ missionId, assessmentId, organizationLearnerId });
      await databaseBuilder.commit();

      const result = await missionAssessmentRepository.getByAssessmentId(assessmentId);

      expect(result).to.deep.equal(new MissionAssessment({ missionId, assessmentId, organizationLearnerId }));
    });
  });
});
