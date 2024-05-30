import { usecases } from '../../../../lib/domain/usecases/index.js';
import { expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCase | update-target-profile', function () {
  let targetProfileForAdminRepository, targetProfileForUpdateRepository;

  beforeEach(function () {
    targetProfileForAdminRepository = {
      get: sinon.stub(),
    };

    targetProfileForUpdateRepository = {
      update: sinon.stub(),
    };
  });

  context('when the target profile exists', function () {
    it('should call targetProfileForUpdateRepository #update method', async function () {
      // given
      const existingTargetProfileForAdmin = {
        id: 1,
        update: sinon.stub(),
      };

      const attributesToUpdate = {
        name: 'new name',
        category: 'OTHER',
        description: 'new description',
        comment: 'new comment',
        imageUrl: 'http://img.org',
        areKnowledgeElementsResettable: false,
      };

      targetProfileForAdminRepository.get.resolves(existingTargetProfileForAdmin);

      // when
      await usecases.updateTargetProfile({
        id: 1,
        attributesToUpdate,
        targetProfileForAdminRepository,
        targetProfileForUpdateRepository,
      });

      // then
      expect(existingTargetProfileForAdmin.update).to.have.been.calledOnceWithExactly(attributesToUpdate);

      expect(targetProfileForUpdateRepository.update).to.have.been.calledOnce;
    });
  });
});
