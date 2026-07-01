import {
  CampaignTypeError,
  OrganizationNotAuthorizedMultipleSendingAssessmentToCreateCampaignError,
  OrganizationNotAuthorizedToCreateCampaignError,
  UserNotAuthorizedToCreateCampaignError,
} from '../../../../../../src/prescription/campaign/domain/errors.js';
import { CampaignCreator } from '../../../../../../src/prescription/campaign/domain/models/CampaignCreator.js';
import { CampaignForCreation } from '../../../../../../src/prescription/campaign/domain/models/CampaignForCreation.js';
import { CampaignTypes } from '../../../../../../src/prescription/shared/domain/constants.js';
import { ORGANIZATION_FEATURE } from '../../../../../../src/shared/constants.js';
import { EntityValidationError } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

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

    describe('when campaign type is not supported', function () {
      it('throws a CampaignTypeError', async function () {
        const error = await catchErr(function () {
          const availableTargetProfileIds = [1, 2];
          const creator = new CampaignCreator({ availableTargetProfileIds, organizationFeatures });
          const campaignData = {
            name: 'campagne utilisateur',
            type: 'WRONG TYPE',
            creatorId: 1,
            ownerId: 1,
            organizationId: 2,
            targetProfileId: 2,
            multipleSendings: true,
          };

          creator.createCampaign(campaignData);
        })();

        expect(error).to.be.an.instanceOf(CampaignTypeError);
      });
    });

    describe('when the campaign to create is an assessment campaign', function () {
      describe('when the creator cannot use the targetProfileId', function () {
        describe('when the option allowCreationWithoutTargetProfileShare is true', function () {
          it('creates the campaign', function () {
            const availableTargetProfileIds = [1, 2];
            const creator = new CampaignCreator({ availableTargetProfileIds, organizationFeatures });
            const campaignData = {
              name: 'campagne utilisateur',
              type: CampaignTypes.ASSESSMENT,
              creatorId: 1,
              ownerId: 1,
              organizationId: 2,
              targetProfileId: 5,
              multipleSendings: true,
            };
            const expectedCampaignForCreation = new CampaignForCreation(campaignData);

            const campaignForCreation = creator.createCampaign(campaignData, {
              allowCreationWithoutTargetProfileShare: true,
            });

            expect(campaignForCreation).to.deep.equal(expectedCampaignForCreation);
          });
        });
        describe('when the option allowCreationWithoutTargetProfileShare is undefined', function () {
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

    describe('campaign without user profile (EXAM)', function () {
      it('should create a campaign if type exam when feature is enabled', async function () {
        organizationFeatures[ORGANIZATION_FEATURE.CAMPAIGN_WITHOUT_USER_PROFILE.key] = true;
        const availableTargetProfileIds = [1, 2];
        const creator = new CampaignCreator({ availableTargetProfileIds, organizationFeatures });
        const campaignData = {
          name: 'campagne utilisateur',
          type: CampaignTypes.EXAM,
          creatorId: 1,
          ownerId: 1,
          organizationId: 2,
          targetProfileId: 2,
        };

        const result = creator.createCampaign(campaignData);

        expect(result.type).to.be.equal(CampaignTypes.EXAM);
      });
      it('throws an error when campaign without user profile is not available', async function () {
        organizationFeatures[ORGANIZATION_FEATURE.CAMPAIGN_WITHOUT_USER_PROFILE.key] = false;
        const availableTargetProfileIds = [1, 2];
        const creator = new CampaignCreator({ availableTargetProfileIds, organizationFeatures });
        const campaignData = {
          name: 'campagne utilisateur',
          type: CampaignTypes.EXAM,
          creatorId: 1,
          ownerId: 1,
          organizationId: 2,
          targetProfileId: 2,
        };

        const error = await catchErr(creator.createCampaign, creator)(campaignData);

        expect(error).to.be.instanceOf(OrganizationNotAuthorizedToCreateCampaignError);
      });

      describe('when the creator cannot use the targetProfileId', function () {
        describe('when the option allowCreationWithoutTargetProfileShare is true', function () {
          it('creates the campaign', function () {
            organizationFeatures[ORGANIZATION_FEATURE.CAMPAIGN_WITHOUT_USER_PROFILE.key] = true;
            const availableTargetProfileIds = [1, 2];
            const creator = new CampaignCreator({ availableTargetProfileIds, organizationFeatures });
            const campaignData = {
              name: 'campagne utilisateur',
              type: CampaignTypes.EXAM,
              creatorId: 1,
              ownerId: 1,
              organizationId: 2,
              targetProfileId: 5,
              multipleSendings: true,
            };
            const expectedCampaignForCreation = new CampaignForCreation(campaignData);

            const campaignForCreation = creator.createCampaign(campaignData, {
              allowCreationWithoutTargetProfileShare: true,
            });

            expect(campaignForCreation).to.deep.equal(expectedCampaignForCreation);
          });
        });
        describe('when the option allowCreationWithoutTargetProfileShare is undefined', function () {
          it('throws an error', async function () {
            organizationFeatures[ORGANIZATION_FEATURE.CAMPAIGN_WITHOUT_USER_PROFILE.key] = true;
            const availableTargetProfileIds = [1, 2];
            const creator = new CampaignCreator({ availableTargetProfileIds, organizationFeatures });
            const campaignData = {
              name: 'campagne utilisateur',
              type: CampaignTypes.EXAM,
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
      });
    });
  });
});
