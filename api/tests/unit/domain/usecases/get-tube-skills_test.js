const { expect, sinon } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | UseCase | get-tube-skills', function () {
  let skillRepository, expectedSkillsResult;

  beforeEach(function () {
    expectedSkillsResult = [{ id: 'skillId1' }, { id: 'skillId2' }];

    skillRepository = {
      findActiveByTubeId: sinon.stub().resolves(expectedSkillsResult),
    };
  });

  it('should get skills by tube', async function () {
    // given
    const tubeId = 'tubeId';

    // when
    const response = await usecases.getTubeSkills({
      skillRepository,
      tubeId,
    });

    // then
    expect(skillRepository.findActiveByTubeId).to.have.been.calledWith(tubeId);
    expect(response).to.deep.equal(expectedSkillsResult);
  });
});
