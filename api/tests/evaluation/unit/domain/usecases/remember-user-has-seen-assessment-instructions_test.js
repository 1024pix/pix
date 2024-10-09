import { rememberUserHasSeenAssessmentInstructions } from '../../../../../src/evaluation/domain/usecases/remember-user-has-seen-assessment-instructions.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | UseCase | remember-user-has-seen-assessment-instructions', function () {
  let userRepository;

  beforeEach(function () {
    userRepository = { updateAssessmentInstructionsInfoAsSeen: sinon.stub() };
  });

  it('should update has seen assessment instructions', async function () {
    // given
    const userId = 'userId';
    const updatedUser = Symbol('updateduser');
    userRepository.updateAssessmentInstructionsInfoAsSeen.resolves(updatedUser);

    // when
    const actualUpdatedUser = await rememberUserHasSeenAssessmentInstructions({ userId, userRepository });

    // then
    expect(userRepository.updateAssessmentInstructionsInfoAsSeen).to.have.been.calledWithExactly({ userId });
    expect(actualUpdatedUser).to.equal(updatedUser);
  });
});
