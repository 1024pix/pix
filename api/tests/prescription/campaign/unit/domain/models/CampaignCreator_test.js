import { CampaignCreator } from '../../../../../../src/prescription/campaign/domain/models/CampaignCreator.js';
import { CampaignForCreation } from '../../../../../../src/prescription/campaign/domain/models/CampaignForCreation.js';
import { CampaignTypes } from '../../../../../../src/prescription/shared/domain/constants.js';
import { ORGANIZATION_FEATURE } from '../../../../../../src/shared/domain/constants.js';
import {
  OrganizationNotAuthorizedMultipleSendingAssessmentToCreateCampaignError,
  UserNotAuthorizedToCreateCampaignError,
} from '../../../../../../src/shared/domain/errors.js';
import { EntityValidationError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, expect } from '../../../../../test-helper.js';

describe('Unit | Domain | Models | CampaignCreator', function () {
  let organizationFeatures;

  beforeEach(function () {
    organizationFeatures = {};
    organizationFeatures[ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key] = true;
  });

  describe('#constructor', function () {
    describe('#availableTargetProfileIds', function () {
      it('should instanciate CampaignCreator available target profile for campaign', function () {
        const availableTargetProfileIds = [1, 2];

        const creator = new CampaignCreator({ availableTargetProfileIds, organizationFeatures });

        expect(creator.availableTargetProfileIds).to.deep.equal(availableTargetProfileIds);
      });
    });

    describe('#isMultipleSendingsAssessmentEnabled', function () {
      it('should instanciate CampaignCreator multiple sendings assessment for campaign to true', function () {
        organizationFeatures[ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key] = true;

        const creator = new CampaignCreator({ availableTargetProfileIds: [], organizationFeatures });

        expect(creator.isMultipleSendingsAssessmentEnable).to.be.true;
      });

      it('should instanciate CampaignCreator multiple sendings assessment for campaign to false', function () {
        organizationFeatures[ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key] = false;

        const creator = new CampaignCreator({ availableTargetProfileIds: [], organizationFeatures });

        expect(creator.isMultipleSendingsAssessmentEnable).to.be.false;
      });
    });
  });

  describe('#createCampaign', function () {
    describe('when the creator is allowed to create the campaign', function () {
      it('creates the campaign', function () {
        const availableTargetProfileIds = [1, 2];
        const creator = new CampaignCreator({ availableTargetProfileIds, organizationFeatures });
        const campaignData = {
          name: 'campagne utilisateur',
          type: CampaignTypes.ASSESSMENT,
          creatorId: 1,
          ownerId: 1,
          organizationId: 2,
          targetProfileId: 2,
          multipleSendings: true,
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
          const creator = new CampaignCreator({ availableTargetProfileIds, organizationFeatures });
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
            `Organization does not have an access to the profile ${campaignData.targetProfileId}`,
          );
        });
      });

      describe('multiple sending case', function () {
        it('throws an error when multipleSendings is not available', async function () {
          organizationFeatures[ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key] = false;
          const availableTargetProfileIds = [1, 2];
          const creator = new CampaignCreator({ availableTargetProfileIds, organizationFeatures });
          const campaignData = {
            name: 'campagne utilisateur',
            type: CampaignTypes.ASSESSMENT,
            creatorId: 1,
            ownerId: 1,
            multipleSendings: true,
            organizationId: 2,
            targetProfileId: 2,
          };

          const error = await catchErr(creator.createCampaign, creator)(campaignData);

          expect(error).to.be.instanceOf(OrganizationNotAuthorizedMultipleSendingAssessmentToCreateCampaignError);
        });
      });

      describe('when the targetProfileId is not given', function () {
        it('throws an error', async function () {
          const availableTargetProfileIds = [1, 2];
          const creator = new CampaignCreator({ availableTargetProfileIds, organizationFeatures });
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
