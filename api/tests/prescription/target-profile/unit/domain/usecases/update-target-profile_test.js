import { usecases } from '../../../../../../src/prescription/target-profile/domain/usecases/index.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | update-target-profile', function () {
  let targetProfileAdministrationRepository, targetProfileForUpdateRepository;

  beforeEach(function () {
    targetProfileAdministrationRepository = {
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

      targetProfileAdministrationRepository.get.resolves(existingTargetProfileForAdmin);

      // when
      await usecases.updateTargetProfile({
        id: 1,
        attributesToUpdate,
        targetProfileAdministrationRepository,
        targetProfileForUpdateRepository,
      });

      // then
      expect(existingTargetProfileForAdmin.update).to.have.been.calledOnceWithExactly(attributesToUpdate);

      expect(targetProfileForUpdateRepository.update).to.have.been.calledOnce;
    });
  });
});
