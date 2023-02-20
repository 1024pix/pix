import { expect, sinon } from '../../../test-helper';
import rememberUserHasSeenAssessmentInstructions from '../../../../lib/domain/usecases/remember-user-has-seen-assessment-instructions';
import userRepository from '../../../../lib/infrastructure/repositories/user-repository';

describe('Unit | UseCase | remember-user-has-seen-assessment-instructions', function () {
  beforeEach(function () {
    sinon.stub(userRepository, 'updateHasSeenAssessmentInstructionsToTrue');
  });

  it('should update has seen assessment instructions', async function () {
    // given
    const userId = 'userId';
    const updatedUser = Symbol('updateduser');
    userRepository.updateHasSeenAssessmentInstructionsToTrue.resolves(updatedUser);

    // when
    const actualUpdatedUser = await rememberUserHasSeenAssessmentInstructions({ userId, userRepository });

    // then
    expect(userRepository.updateHasSeenAssessmentInstructionsToTrue).to.have.been.calledWith(userId);
    expect(actualUpdatedUser).to.equal(updatedUser);
  });
});
