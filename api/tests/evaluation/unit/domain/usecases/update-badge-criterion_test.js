import { updateBadgeCriterion } from '../../../../../src/evaluation/domain/usecases/update-badge-criterion.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Domain | Use Cases | update-badge-criterion', function () {
  it('should call badgeCriteriaRepository #updateBadgeCriterion', async function () {
    // given
    const badgeCriterion = Symbol('badgeCriterion');
    const badgeCriteriaRepositoryStub = {
      updateCriterion: sinon.stub().resolves(),
    };

    // when
    await updateBadgeCriterion({
      badgeCriterion,
      badgeCriteriaRepository: badgeCriteriaRepositoryStub,
    });

    // then
    expect(badgeCriteriaRepositoryStub.updateCriterion).to.have.been.calledOnceWithExactly({ badgeCriterion });
  });
});
