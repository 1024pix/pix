const { expect, domainBuilder } = require('../../../test-helper');
const campaignValidator = require('../../../../lib/domain/validators/campaign-validator');

const MISSING_VALUE = '';

function _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError) {
  expect(entityValidationErrors.invalidAttributes).to.have.lengthOf(1);
  expect(entityValidationErrors.invalidAttributes[0]).to.deep.equal(expectedError);
}

describe('Unit | Domain | Validators | campaign-validator', function() {

  let campaign;

  beforeEach(() => {
    campaign = domainBuilder.buildCampaign({
      name: 'campagne de test',
      creatorId: 4,
      organizationId: 12,
      idPixLabel: 'Mail Pro',
      targetProfileId: 44,
    });
  });

  describe('#validate', () => {

    context('when validation is successful', () => {

      it('should not throw any error', () => {
        expect(campaignValidator.validate(campaign)).to.not.throw;
      });

      it('should resolve when idPixLabel is null', () => {
        // given
        campaign.idPixLabel = null;

        // when/then
        expect(campaignValidator.validate(campaign)).to.not.throw;
      });

    });

    context('when campaign data validation fails', () => {

      context('on name attribute', () => {

        it('should reject with error when name is missing', () => {
          // given
          const expectedError = {
            attribute: 'name',
            message: 'Veuillez donner un nom à votre campagne.'
          };
          campaign.name = MISSING_VALUE;

          try {
            // when
            campaignValidator.validate(campaign);
            expect.fail('should have thrown an error');
          } catch (entityValidationErrors) {
            // then
            _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
          }
        });

      });

      context('on creatorId attribute', () => {

        it('should reject with error when creatorId is missing', () => {
          // given
          const expectedError = {
            attribute: 'creatorId',
            message: 'Le créateur n’est pas renseigné.'
          };
          campaign.creatorId = MISSING_VALUE;

          try {
            // when
            campaignValidator.validate(campaign);
            expect.fail('should have thrown an error');

          } catch (entityValidationErrors) {
            // then
            _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
          }
        });

      });

      context('on organizationId attribute', () => {

        it('should reject with error when organizationId is missing', () => {
          // given
          const expectedError = {
            attribute: 'organizationId',
            message: 'L‘organisation n’est pas renseignée.'
          };
          campaign.organizationId = MISSING_VALUE;

          try {
            // when
            campaignValidator.validate(campaign);
            expect.fail('should have thrown an error');

          } catch (entityValidationErrors) {
            // then
            _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
          }
        });

      });

      context('on idPixLabel attribute', () => {
        it('should reject with error when idPixLabel is an empty string', () => {
          // given
          const expectedError = {
            attribute: 'idPixLabel',
            message: 'Veuillez préciser le libellé du champ qui sera demandé à vos participants au démarrage du parcours.'
          };
          campaign.idPixLabel = '';

          try {
            // when
            campaignValidator.validate(campaign);
            expect.fail('should have thrown an error');

          } catch (entityValidationErrors) {
            // then
            _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
          }
        });

        it('should reject with error when idPixLabel length is under 3 characters', () => {
          // given
          const expectedError = {
            attribute: 'idPixLabel',
            message: 'Veuillez préciser le libellé du champ qui sera demandé à vos participants au démarrage du parcours.'
          };
          campaign.idPixLabel = 'AZ';

          try {
            // when
            campaignValidator.validate(campaign);
            expect.fail('should have thrown an error');

          } catch (entityValidationErrors) {
            // then
            _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
          }
        });

      });

      context('on targetProfileId attribute', () => {

        it('should reject with error when targetProfileId is missing', () => {
          // given
          const expectedError = {
            attribute: 'targetProfileId',
            message: 'Veuillez sélectionner un profil cible pour votre campagne.'
          };
          campaign.targetProfileId = MISSING_VALUE;

          try {
            // when
            campaignValidator.validate(campaign);
            expect.fail('should have thrown an error');

          } catch (entityValidationErrors) {
            // then
            _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
          }
        });

      });

      it('should reject with errors on all fields (but only once by field) when all fields are missing', () => {
        // given
        campaign.name = MISSING_VALUE;
        campaign.creatorId = MISSING_VALUE;
        campaign.organizationId = MISSING_VALUE;
        campaign.targetProfileId = MISSING_VALUE;

        try {
          // when
          campaignValidator.validate(campaign);
          expect.fail('should have thrown an error');

        } catch (entityValidationErrors) {
          // then
          expect(entityValidationErrors.invalidAttributes).to.have.lengthOf(4);
        }
      });

    });
  });
});
