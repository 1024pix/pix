import { Assessment } from '../../../../lib/domain/models/Assessment.js';
import { createMissionAssessment } from '../../../../lib/domain/usecases/create-mission-assessment.js';
import { expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCase | create-mission-assessment', function () {
  let assessmentRepository;

  beforeEach(function () {
    assessmentRepository = { save: sinon.stub() };
  });

  it('should save the mission assessment', async function () {
    // given
    const missionId = 'ABCDEF123';

    const assessment = Assessment.createForPix1dMission({ missionId });
    const expectedResult = Symbol('mission');

    assessmentRepository.save.withArgs({ assessment }).resolves(expectedResult);

    // when
    const result = await createMissionAssessment({
      missionId,
      assessmentRepository,
    });

    // then
    expect(result).to.equal(expectedResult);
  });
});
