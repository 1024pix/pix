import { expect, catchErr } from '../../../test-helper';
import CampaignForCreation from '../../../../lib/domain/models/CampaignForCreation';
import CampaignTypes from '../../../../lib/domain/models/CampaignTypes';

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
