import { expect, catchErr } from '../../../test-helper.js';
import { CampaignForCreation } from '../../../../lib/domain/models/CampaignForCreation.js';
import { CampaignTypes } from '../../../../lib/domain/models/CampaignTypes.js';

describe('Unit | Domain | Models | CampaignForCreation', function () {
  describe('#create', function () {
    context('when the campaign type is ASSESSEMENT', function () {
      context('when the every required field is present', function () {
        it('creates the campaign', function () {
          const attributes = {
            name: 'CampaignName',
            type: CampaignTypes.ASSESSMENT,
            targetProfileId: 1,
            creatorId: 2,
            ownerId: 2,
            organizationId: 3,
            title: '',
            customLandingPageText: '',
            customResultPageButtonText: null,
            customResultPageButtonUrl: null,
          };

          expect(() => new CampaignForCreation(attributes)).to.not.throw();
        });
      });

      context('when attributes are invalid', function () {
        let attributes;
        beforeEach(function () {
          attributes = {
            name: 'CampaignName',
            type: CampaignTypes.ASSESSMENT,
            targetProfileId: 1,
            creatorId: 2,
            ownerId: 2,
            organizationId: 3,
          };
        });

        context('name is missing', function () {
          it('throws an error', async function () {
            attributes.name = undefined;

            const error = await catchErr(() => new CampaignForCreation(attributes))();
            expect(error.message).to.equal("Échec de validation de l'entité.");
            expect(error.invalidAttributes).to.deep.equal([{ attribute: 'name', message: '"name" is required' }]);
          });
        });

        context('creatorId is missing', function () {
          it('throws an error', async function () {
            attributes.creatorId = undefined;

            const error = await catchErr(() => new CampaignForCreation(attributes))();
            expect(error.message).to.equal("Échec de validation de l'entité.");
            expect(error.invalidAttributes).to.deep.equal([{ attribute: 'creatorId', message: 'MISSING_CREATOR' }]);
          });
        });

        context('ownerId is missing', function () {
          it('throws an error', async function () {
            attributes.ownerId = undefined;

            const error = await catchErr(() => new CampaignForCreation(attributes))();
            expect(error.message).to.equal("Échec de validation de l'entité.");
            expect(error.invalidAttributes).to.deep.equal([{ attribute: 'ownerId', message: 'MISSING_OWNER' }]);
          });
        });

        context('organizationId is missing', function () {
          it('throws an error', async function () {
            attributes.organizationId = undefined;

            const error = await catchErr(() => new CampaignForCreation(attributes))();
            expect(error.message).to.equal("Échec de validation de l'entité.");
            expect(error.invalidAttributes).to.deep.equal([
              { attribute: 'organizationId', message: 'MISSING_ORGANIZATION' },
            ]);
          });
        });

        context('targetProfileId is missing', function () {
          it('throws an error', async function () {
            attributes.targetProfileId = undefined;

            const error = await catchErr(() => new CampaignForCreation(attributes))();
            expect(error.message).to.equal("Échec de validation de l'entité.");
            expect(error.invalidAttributes).to.deep.equal([
              { attribute: 'targetProfileId', message: 'TARGET_PROFILE_IS_REQUIRED' },
            ]);
          });
        });

        context('customLandingPageText max length over 5000 character', function () {
          it('throws an error', async function () {
            // given
            attributes.customLandingPageText = 'Godzilla vs Kong'.repeat(335);

            const error = await catchErr(() => new CampaignForCreation(attributes))();
            expect(error.message).to.equal("Échec de validation de l'entité.");
            expect(error.invalidAttributes).to.deep.equal([
              { attribute: 'customLandingPageText', message: 'CUSTOM_LANDING_PAGE_TEXT_IS_TOO_LONG' },
            ]);
          });
        });

        context('customResultPageText max length over 5000 character', function () {
          it('throws an error', async function () {
            // given
            attributes.customResultPageText = 'Godzilla vs Kong'.repeat(335);

            const error = await catchErr(() => new CampaignForCreation(attributes))();
            expect(error.message).to.equal("Échec de validation de l'entité.");
            expect(error.invalidAttributes).to.deep.equal([
              { attribute: 'customResultPageText', message: 'CUSTOM_RESULT_PAGE_TEXT_IS_TOO_LONG' },
            ]);
          });
        });

        context('customResultPageButtonUrl is required if customResultPageButtonText is defined', function () {
          it('throws an error', async function () {
            // given
            attributes.customResultPageButtonText = 'Godzilla vs Kong';
            attributes.customResultPageButtonUrl = null;

            const error = await catchErr(() => new CampaignForCreation(attributes))();
            expect(error.message).to.equal("Échec de validation de l'entité.");
            expect(error.invalidAttributes).to.deep.equal([
              {
                attribute: 'customResultPageButtonUrl',
                message: 'CUSTOM_RESULT_PAGE_BUTTON_URL_IS_REQUIRED_WHEN_CUSTOM_RESULT_PAGE_BUTTON_TEXT_IS_FILLED',
              },
            ]);
          });
        });

        context('customResultPageButtonText is required if customResultPageButtonUrl is defined', function () {
          it('throws an error', async function () {
            // given
            attributes.customResultPageButtonUrl = 'https://http.dog/';
            attributes.customResultPageButtonText = null;

            const error = await catchErr(() => new CampaignForCreation(attributes))();
            expect(error.message).to.equal("Échec de validation de l'entité.");
            expect(error.invalidAttributes).to.deep.equal([
              {
                attribute: 'customResultPageButtonText',
                message: 'CUSTOM_RESULT_PAGE_BUTTON_TEXT_IS_REQUIRED_WHEN_CUSTOM_RESULT_PAGE_BUTTON_URL_IS_FILLED',
              },
            ]);
          });
        });

        context('customResultPageButtonUrl must be an URL', function () {
          it('throws an error', async function () {
            // given
            attributes.customResultPageButtonText = 'Godzilla vs Kong';
            attributes.customResultPageButtonUrl = 'Godzilla vs Kong';

            const error = await catchErr(() => new CampaignForCreation(attributes))();
            expect(error.message).to.equal("Échec de validation de l'entité.");
            expect(error.invalidAttributes).to.deep.equal([
              { attribute: 'customResultPageButtonUrl', message: 'CUSTOM_RESULT_PAGE_BUTTON_URL_MUST_BE_A_URL' },
            ]);
          });
        });
      });
    });

    context('when the campaign type is PROFILES_COLLECTION', function () {
      context('when the every required field is present', function () {
        it('should create the campaign', function () {
          const attributes = {
            name: 'CampaignName',
            type: CampaignTypes.PROFILES_COLLECTION,
            creatorId: 2,
            ownerId: 2,
            organizationId: 3,
          };

          expect(() => new CampaignForCreation(attributes)).to.not.throw();
        });
      });

      context('when attributes are invalid', function () {
        let attributes;
        beforeEach(function () {
          attributes = {
            name: 'CampaignName',
            type: CampaignTypes.PROFILES_COLLECTION,
            creatorId: 2,
            ownerId: 2,
            organizationId: 3,
          };
        });

        context('name is missing', function () {
          it('throws an error', async function () {
            attributes.name = undefined;

            const error = await catchErr(() => new CampaignForCreation(attributes))();
            expect(error.message).to.equal("Échec de validation de l'entité.");
            expect(error.invalidAttributes).to.deep.equal([{ attribute: 'name', message: '"name" is required' }]);
          });
        });

        context('creatorId is missing', function () {
          it('throws an error', async function () {
            attributes.creatorId = undefined;

            const error = await catchErr(() => new CampaignForCreation(attributes))();
            expect(error.message).to.equal("Échec de validation de l'entité.");
            expect(error.invalidAttributes).to.deep.equal([{ attribute: 'creatorId', message: 'MISSING_CREATOR' }]);
          });
        });

        context('ownerId is missing', function () {
          it('throws an error', async function () {
            attributes.ownerId = undefined;

            const error = await catchErr(() => new CampaignForCreation(attributes))();
            expect(error.message).to.equal("Échec de validation de l'entité.");
            expect(error.invalidAttributes).to.deep.equal([{ attribute: 'ownerId', message: 'MISSING_OWNER' }]);
          });
        });

        context('organizationId is missing', function () {
          it('throws an error', async function () {
            attributes.organizationId = undefined;

            const error = await catchErr(() => new CampaignForCreation(attributes))();
            expect(error.message).to.equal("Échec de validation de l'entité.");
            expect(error.invalidAttributes).to.deep.equal([
              { attribute: 'organizationId', message: 'MISSING_ORGANIZATION' },
            ]);
          });
        });

        context('targetProfileId is provided', function () {
          it('throws an error', async function () {
            attributes.targetProfileId = 1;

            const error = await catchErr(() => new CampaignForCreation(attributes))();
            expect(error.message).to.equal("Échec de validation de l'entité.");
            expect(error.invalidAttributes).to.deep.equal([
              { attribute: 'targetProfileId', message: 'TARGET_PROFILE_NOT_ALLOWED_FOR_PROFILES_COLLECTION_CAMPAIGN' },
            ]);
          });
        });

        context('title is provided', function () {
          it('throws an error', async function () {
            attributes.title = 'Title';

            const error = await catchErr(() => new CampaignForCreation(attributes))();
            expect(error.message).to.equal("Échec de validation de l'entité.");
            expect(error.invalidAttributes).to.deep.equal([
              {
                attribute: 'title',
                message: 'TITLE_OF_PERSONALISED_TEST_IS_NOT_ALLOWED_FOR_PROFILES_COLLECTION_CAMPAIGN',
              },
            ]);
          });
        });
      });
    });

    context('when the campaign type is something else', function () {
      it('throws an error', async function () {
        const attributes = {
          name: 'CampaignName',
          type: 'BAD TYPE',
          creatorId: 2,
          ownerId: 2,
          organizationId: 3,
        };

        const error = await catchErr(() => new CampaignForCreation(attributes))();
        expect(error.message).to.equal("Échec de validation de l'entité.");
        expect(error.invalidAttributes).to.deep.equal([{ attribute: 'type', message: 'CAMPAIGN_PURPOSE_IS_REQUIRED' }]);
      });
    });
  });
});
