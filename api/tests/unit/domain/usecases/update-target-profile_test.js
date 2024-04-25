import { NotFoundError } from '../../../../lib/domain/errors.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { catchErr, expect, sinon } from '../../../test-helper.js';

describe('Unit | UseCase | update-target-profile', function () {
  let targetProfileForAdminRepository, targetProfileForUpdateRepository;

  beforeEach(function () {
    targetProfileForAdminRepository = {
      get: sinon.stub(),
    };

    targetProfileForUpdateRepository = {
      update: sinon.stub(),
      updateWithTubes: sinon.stub(),
    };
  });

  context('when the target profile does not exist', function () {
    it('should throw a NotFound error', async function () {
      // given
      const attributesToUpdate = Symbol('some attributes to update');

      targetProfileForAdminRepository.get.rejects();

      // when
      const error = await catchErr(usecases.updateTargetProfile)({
        id: 1,
        attributesToUpdate,
        targetProfileForAdminRepository,
        targetProfileForUpdateRepository,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(targetProfileForUpdateRepository.updateWithTubes).to.not.have.been.called;
    });
  });

  context('when the target profile exists', function () {
    context('when there is some tube update', function () {
      context('when target profile is linked with campaign', function () {
        it('should throw an error', async function () {
          // given
          const attributesToUpdate = {
            tubes: [{ id: 1, level: 1 }],
          };

          targetProfileForAdminRepository.get.resolves({
            hasLinkedCampaign: true,
          });

          // when
          const error = await catchErr(usecases.updateTargetProfile)({
            id: 1,
            attributesToUpdate,
            targetProfileForAdminRepository,
            targetProfileForUpdateRepository,
          });

          // then
          expect(error).to.be.instanceOf(Error);
          expect(targetProfileForUpdateRepository.updateWithTubes).to.not.have.been.called;
        });
      });

      context('when target profile is not linked with campaign', function () {
        it('should call targetProfileForUpdateRepository #updateWithTubes method', async function () {
          // given
          const attributesToUpdate = {
            description: 'description changée',
            comment: 'commentaire changé',
            tubes: [{ id: 1, level: 7 }],
          };

          targetProfileForAdminRepository.get.resolves({
            hasLinkedCampaign: false,
          });

          // when
          await usecases.updateTargetProfile({
            id: 1,
            attributesToUpdate,
            targetProfileForAdminRepository,
            targetProfileForUpdateRepository,
          });

          // then
          expect(targetProfileForUpdateRepository.updateWithTubes).to.have.been.calledOnceWithExactly(
            1,
            attributesToUpdate,
          );
        });
      });
    });

    context('when no tubes are about to be updated', function () {
      it('should call targetProfileForUpdateRepository #update method', async function () {
        // given
        const attributesToUpdate = {
          name: 'new name',
          category: 'OTHER',
          description: 'new description',
          comment: 'new comment',
          imageUrl: 'http://img.org',
          areKnowledgeElementsResettable: false,
        };

        targetProfileForAdminRepository.get.resolves({
          hasLinkedCampaign: false,
        });

        // when
        await usecases.updateTargetProfile({
          id: 1,
          attributesToUpdate,
          targetProfileForAdminRepository,
          targetProfileForUpdateRepository,
        });

        // then
        expect(targetProfileForUpdateRepository.update).to.have.been.calledOnceWithExactly({
          targetProfileId: 1,
          ...attributesToUpdate,
        });
      });
    });
  });
});
