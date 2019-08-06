const { expect, sinon, catchErr } = require('../../../test-helper');
const rememberUserHasSeenAssessmentInstructions = require('../../../../lib/domain/usecases/remember-user-has-seen-assessment-instructions');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | remember-user-has-seen-assessment-instructions', () => {

  beforeEach(() => {
    sinon.stub(userRepository, 'get');
    sinon.stub(userRepository, 'updateUser');
  });

  it('should update user hasSeenAssessmentInstructions', async () => {
    // given
    const authenticatedUserId = 1;
    const requestedUserId = 1;
    userRepository.get.withArgs(requestedUserId).resolves({ id: 1 });
    userRepository.updateUser.withArgs({ id: 1, hasSeenAssessmentInstructions: true }).resolves('ok');

    // when
    const result = await rememberUserHasSeenAssessmentInstructions({ authenticatedUserId, requestedUserId, userRepository });

    // then
    expect(result).to.be.equal('ok');
  });

  it('should throw an error if authenticated user is different from requested user', async () => {
    // given
    const authenticatedUserId = 1;
    const requestedUserId = 2;

    // when
    const result = await catchErr(rememberUserHasSeenAssessmentInstructions)({ authenticatedUserId, requestedUserId, userRepository });

    // then
    expect(result).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
  });

});
