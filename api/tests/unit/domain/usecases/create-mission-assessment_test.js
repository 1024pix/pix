const { expect, sinon } = require('../../../test-helper');
const createMissionAssessment = require('../../../../lib/domain/usecases/create-mission-assessment');
const Assessment = require('../../../../lib/domain/models/Assessment');

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
