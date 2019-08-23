const { expect, sinon } = require('../../../test-helper');
const rememberUserHasSeenAssessmentInstructions = require('../../../../lib/domain/usecases/remember-user-has-seen-assessment-instructions');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');

describe('Unit | UseCase | remember-user-has-seen-assessment-instructions', () => {

  beforeEach(() => {
    sinon.stub(userRepository, 'get');
    sinon.stub(userRepository, 'updateUser');
  });

  it('should update user hasSeenAssessmentInstructions', async () => {
    // given
    const userId = 1;
    userRepository.get.withArgs(userId).resolves({ id: 1 });
    userRepository.updateUser.withArgs({ id: 1, hasSeenAssessmentInstructions: true }).resolves('ok');

    // when
    const result = await rememberUserHasSeenAssessmentInstructions({ userId, userRepository });

    // then
    expect(result).to.be.equal('ok');
  });
});
