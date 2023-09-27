import { expect, sinon } from '../../../test-helper.js';
import { rememberUserHasSeenAssessmentInstructions } from '../../../../lib/domain/usecases/remember-user-has-seen-assessment-instructions.js';

describe('Unit | UseCase | remember-user-has-seen-assessment-instructions', function () {
  let userRepository;
  beforeEach(function () {
    userRepository = { updateHasSeenAssessmentInstructionsToTrue: sinon.stub() };
  });

  it('should update has seen assessment instructions', async function () {
    // given
    const userId = 'userId';
    const updatedUser = Symbol('updateduser');
    userRepository.updateHasSeenAssessmentInstructionsToTrue.resolves(updatedUser);

    // when
    const actualUpdatedUser = await rememberUserHasSeenAssessmentInstructions({ userId, userRepository });

    // then
    expect(userRepository.updateHasSeenAssessmentInstructionsToTrue).to.have.been.calledWithExactly(userId);
    expect(actualUpdatedUser).to.equal(updatedUser);
  });
});
