import { AcquiredBadgeForbiddenUpdateError } from '../../../../../src/evaluation/domain/errors.js';
import { updateBadgeCriterion } from '../../../../../src/evaluation/domain/usecases/update-badge-criterion.js';
import { catchErr, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Domain | Use Cases | update-badge-criterion', function () {
  context('when badge is not already acquired', function () {
    it('should call badgeCriteriaRepository #updateBadgeCriterion', async function () {
      // given
      const attributesToUpdate = Symbol('badgeCriterion');
      const badgeCriteriaRepositoryStub = {
        updateCriterion: sinon.stub().resolves(),
      };
      const badgeRepositoryStub = {
        isAssociated: sinon.stub().returns(false),
      };

      // when
      await updateBadgeCriterion({
        id: 1,
        attributesToUpdate,
        badgeCriteriaRepository: badgeCriteriaRepositoryStub,
        badgeRepository: badgeRepositoryStub,
      });

      // then
      expect(badgeCriteriaRepositoryStub.updateCriterion).to.have.been.calledOnceWithExactly(1, attributesToUpdate);
    });
  });

  context('when badge is already acquired', function () {
    it('should throw an AcquiredBadgeForbiddenUpdateError', async function () {
      // given
      const attributesToUpdate = Symbol('badgeCriterion');
      const badgeCriteriaRepositoryStub = {
        updateCriterion: sinon.stub().resolves(),
      };
      const badgeRepositoryStub = {
        isAssociated: sinon.stub().returns(true),
      };

      // when
      const error = await catchErr(updateBadgeCriterion)({
        id: 1,
        attributesToUpdate,
        badgeCriteriaRepository: badgeCriteriaRepositoryStub,
        badgeRepository: badgeRepositoryStub,
      });

      // then
      expect(error).to.be.instanceOf(AcquiredBadgeForbiddenUpdateError);
      expect(badgeCriteriaRepositoryStub.updateCriterion).to.not.have.been.called;
    });
  });
});
