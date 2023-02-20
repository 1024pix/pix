import CampaignCreator from '../../../../lib/domain/models/CampaignCreator';
import { expect, catchErr } from '../../../test-helper';
import CampaignTypes from '../../../../lib/domain/models/CampaignTypes';
import CampaignForCreation from '../../../../lib/domain/models/CampaignForCreation';
import { UserNotAuthorizedToCreateCampaignError, EntityValidationError } from '../../../../lib/domain/errors';

describe('Unit | Domain | Models | CampaignCreator', function () {
  describe('#createCampaign', function () {
    describe('when the creator is allowed to create the campaign', function () {
      it('creates the campaign', function () {
        const availableTargetProfileIds = [1, 2];
        const creator = new CampaignCreator(availableTargetProfileIds);
        const campaignData = {
          name: 'campagne utilisateur',
          type: CampaignTypes.ASSESSMENT,
          creatorId: 1,
          ownerId: 1,
          organizationId: 2,
          targetProfileId: 2,
        };
        const expectedCampaignForCreation = new CampaignForCreation(campaignData);

        const campaignForCreation = creator.createCampaign(campaignData);

        expect(campaignForCreation).to.deep.equal(expectedCampaignForCreation);
      });
    });

    describe('when the campaign to create is an assessment campaign', function () {
      describe('when the creator cannot use the targetProfileId', function () {
        it('throws an error', async function () {
          const availableTargetProfileIds = [1, 2];
          const creator = new CampaignCreator(availableTargetProfileIds);
          const campaignData = {
            name: 'campagne utilisateur',
            type: CampaignTypes.ASSESSMENT,
            creatorId: 1,
            ownerId: 1,
            organizationId: 2,
            targetProfileId: 5,
          };
          const error = await catchErr(creator.createCampaign, creator)(campaignData);

          expect(error).to.be.instanceOf(UserNotAuthorizedToCreateCampaignError);
          expect(error.message).to.equal(
            `Organization does not have an access to the profile ${campaignData.targetProfileId}`
          );
        });
      });

      describe('when the targetProfileId is not given', function () {
        it('throws an error', async function () {
          const availableTargetProfileIds = [1, 2];
          const creator = new CampaignCreator(availableTargetProfileIds);
          const campaignData = {
            name: 'campagne utilisateur',
            type: CampaignTypes.ASSESSMENT,
            creatorId: 1,
            ownerId: 1,
            organizationId: 2,
            targetProfileId: null,
          };
          const error = await catchErr(creator.createCampaign, creator)(campaignData);

          expect(error).to.be.an.instanceof(EntityValidationError);
          expect(error.message).to.equal("Échec de validation de l'entité.");
          expect(error.invalidAttributes).to.deep.equal([
            { attribute: 'targetProfileId', message: 'TARGET_PROFILE_IS_REQUIRED' },
          ]);
        });
      });
    });
  });
});
