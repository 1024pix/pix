import { expect, sinon, domainBuilder, catchErr } from '../../../test-helper.js';
import { createOrUpdateStageCollection } from '../../../../src/evaluation/domain/usecases/create-or-update-stage-collection.js';
import { StageModificationForbiddenForLinkedTargetProfileError } from '../../../../lib/domain/errors.js';

describe('Unit | UseCase | create or update stage collection', function () {
  context('when the target profile is not linked to a campaign', function () {
    let targetProfileForAdminRepository;

    beforeEach(function () {
      targetProfileForAdminRepository = {
        get: sinon.stub().resolves({
          id: 1,
          hasLinkedCampaign: false,
        }),
      };
    });

    it('should be possible to add a new stage', async function () {
      // given
      const newStages = [
        domainBuilder.buildStage({
          id: null,
          threshold: 0,
          title: 'First stage',
          message: 'First message',
          prescriberTitle: 'First prescriber title',
          prescriberDescription: 'First prescriber description',
        }),
        domainBuilder.buildStage({ id: null, threshold: 10, title: 'Second stage', message: 'Second message' }),
      ];

      const stageCollectionForTargetProfileRepository = {
        getByTargetProfileId: sinon.stub().resolves(
          domainBuilder.buildStageCollectionForTargetProfileManagement({
            stages: [],
          }),
        ),
        update: sinon.stub(),
      };

      // when
      await createOrUpdateStageCollection({
        stagesFromPayload: newStages,
        targetProfileId: 1,
        stageCollectionForTargetProfileRepository,
        targetProfileForAdminRepository,
      });

      // then
      expect(stageCollectionForTargetProfileRepository.update).to.have.been.called;
    });

    it('should be possible to update existing stages', async function () {
      // given
      const alreadyExistingStages = [
        domainBuilder.buildStage({
          id: 1,
          threshold: 0,
          title: 'First stage',
          message: 'First message',
        }),
        domainBuilder.buildStage({ id: 2, threshold: 10, title: 'Second stage', message: 'Second message' }),
      ];

      const stageCollectionForTargetProfileRepository = {
        getByTargetProfileId: sinon.stub().resolves(
          domainBuilder.buildStageCollectionForTargetProfileManagement({
            stages: alreadyExistingStages,
          }),
        ),
        update: sinon.stub(),
      };

      // when
      await createOrUpdateStageCollection({
        stagesFromPayload: [
          { ...alreadyExistingStages[0], title: 'updated title' },
          { ...alreadyExistingStages[1], threshold: 99 },
        ],
        targetProfileId: 1,
        stageCollectionForTargetProfileRepository,
        targetProfileForAdminRepository,
      });

      // then
      expect(stageCollectionForTargetProfileRepository.update).to.have.been.called;
    });
  });

  context('when the target profile is linked to a campaign', function () {
    let stages;
    let targetProfile;
    let stageCollectionForTargetProfileRepository;
    let targetProfileForAdminRepository;

    beforeEach(function () {
      stages = [
        domainBuilder.buildStage({
          id: 1,
          threshold: 0,
          level: undefined,
          title: 'first stage',
          message: 'initial first message',
          prescriberTitle: 'initial first prescriber title',
          prescriberDescription: 'initial first description',
        }),
        domainBuilder.buildStage({
          id: 2,
          threshold: 10,
          level: undefined,
          title: 'second stage',
          message: 'initial second message',
          prescriberTitle: 'initial second prescriber title',
          prescriberDescription: 'initial second description',
        }),
      ];

      stageCollectionForTargetProfileRepository = {
        getByTargetProfileId: sinon.stub().resolves(
          domainBuilder.buildStageCollectionForTargetProfileManagement({
            stages,
          }),
        ),
        update: sinon.stub(),
      };

      targetProfileForAdminRepository = {
        get: sinon.stub().resolves({
          id: 1,
          hasLinkedCampaign: true,
          stageCollection: { stages },
        }),
      };

      targetProfile = domainBuilder.buildTargetProfileForAdmin();
    });

    it('should be possible to update all stage fields that are not threshold or level', async function () {
      // given
      const stagesFromPayload = [
        {
          ...stages[0],
          title: 'updated title',
          message: 'updated message',
          prescriberTitle: 'updated prescriber title',
          prescriberDescription: 'updated prescriber description',
        },
        { ...stages[1] },
      ];

      // when
      await createOrUpdateStageCollection({
        stagesFromPayload,
        targetProfileId: targetProfile.id,
        stageCollectionForTargetProfileRepository,
        targetProfileForAdminRepository,
      });

      // then
      expect(stageCollectionForTargetProfileRepository.update).to.have.been.called;
    });

    it('should throw a specific error if there is a new stage', async function () {
      // given
      const newStage = domainBuilder.buildStage({ id: null });
      const stagesFromPayload = stages.push(newStage);

      // when
      const error = await catchErr(createOrUpdateStageCollection)({
        stagesFromPayload,
        targetProfileId: targetProfile.id,
        stageCollectionForTargetProfileRepository,
        targetProfileForAdminRepository,
      });

      // then
      expect(error).to.be.instanceOf(StageModificationForbiddenForLinkedTargetProfileError);
      expect(error.message).to.be.equal(
        `Le profil cible ${targetProfile.id} est déjà rattaché à une campagne. La modification du seuil ou niveau est alors impossible.`,
      );
      expect(stageCollectionForTargetProfileRepository.update).to.not.have.been.called;
    });

    it('should throw a specific error if a saved stage is deleted', async function () {
      // given
      const stagesFromPayload = stages.pop();

      // when
      const error = await catchErr(createOrUpdateStageCollection)({
        stagesFromPayload,
        targetProfileId: targetProfile.id,
        stageCollectionForTargetProfileRepository,
        targetProfileForAdminRepository,
      });

      // then
      expect(error).to.be.instanceOf(StageModificationForbiddenForLinkedTargetProfileError);
      expect(error.message).to.be.equal(
        `Le profil cible ${targetProfile.id} est déjà rattaché à une campagne. La modification du seuil ou niveau est alors impossible.`,
      );
      expect(stageCollectionForTargetProfileRepository.update).to.not.have.been.called;
    });

    it('should throw a specific error if there is an update of any threshold', async function () {
      // given
      const stagesFromPayload = [stages[0], { ...stages[1], threshold: 99 }];

      // when
      const error = await catchErr(createOrUpdateStageCollection)({
        stagesFromPayload,
        targetProfileId: targetProfile.id,
        stageCollectionForTargetProfileRepository,
        targetProfileForAdminRepository,
      });

      // then
      expect(error).to.be.instanceOf(StageModificationForbiddenForLinkedTargetProfileError);
      expect(error.message).to.be.equal(
        `Le profil cible ${targetProfile.id} est déjà rattaché à une campagne. La modification du seuil ou niveau est alors impossible.`,
      );
      expect(stageCollectionForTargetProfileRepository.update).to.not.have.been.called;
    });

    it('should throw a specific error if there is an update of any level', async function () {
      // given
      const stagesFromPayload = [stages[0], { ...stages[1], level: 1 }];

      // when
      const error = await catchErr(createOrUpdateStageCollection)({
        stagesFromPayload,
        targetProfileId: targetProfile.id,
        stageCollectionForTargetProfileRepository,
        targetProfileForAdminRepository,
      });

      // then
      expect(error).to.be.instanceOf(StageModificationForbiddenForLinkedTargetProfileError);
      expect(error.message).to.be.equal(
        `Le profil cible ${targetProfile.id} est déjà rattaché à une campagne. La modification du seuil ou niveau est alors impossible.`,
      );
      expect(stageCollectionForTargetProfileRepository.update).to.not.have.been.called;
    });
  });
});
