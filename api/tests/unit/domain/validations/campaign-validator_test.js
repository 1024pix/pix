const { expect, factory } = require('../../../test-helper');
const { EntityValidationError } = require('../../../../lib/domain/errors');
const campaignValidator = require('../../../../lib/domain/validators/campaign-validator');

const MISSING_VALUE = '';

function _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError) {
  expect(entityValidationErrors.invalidAttributes).to.have.lengthOf(1);
  expect(entityValidationErrors.invalidAttributes[0]).to.deep.equal(expectedError);
}

describe('Unit | Domain | Validators | campaign-validator', function() {

  let campaign;

  beforeEach(() => {
    campaign = factory.buildCampaign({
      name: 'campagne de test',
      creatorId: 4,
      organizationId: 12,
    });
  });

  describe('#validate', () => {

    context('when validation is successful', () => {

      it('should resolve (with no value) when validation is successful', () => {
        // when
        const promise = campaignValidator.validate(campaign);

        // then
        return expect(promise).to.be.fulfilled;
      });

    });

    context('when campaign data validation fails', () => {

      context('on name attribute', () => {

        it('should reject with error when name is missing', () => {
          // given
          const expectedError = {
            attribute: 'name',
            message: 'Le nom n’est pas renseigné.'
          };
          campaign.name = MISSING_VALUE;

          // when
          const promise = campaignValidator.validate(campaign);

          // then
          return expect(promise).to.be.rejectedWith(EntityValidationError)
            .then((entityValidationErrors) => _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError));
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

          // when
          const promise = campaignValidator.validate(campaign);

          // then
          return expect(promise).to.be.rejectedWith(EntityValidationError)
            .then((entityValidationErrors) => _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError));
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

          // when
          const promise = campaignValidator.validate(campaign);

          // then
          return expect(promise).to.be.rejectedWith(EntityValidationError)
            .then((entityValidationErrors) => _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError));
        });

      });

      it('should reject with errors on all fields (but only once by field) when all fields are missing', () => {
        // given
        campaign.name = MISSING_VALUE;
        campaign.creatorId = MISSING_VALUE;
        campaign.organizationId = MISSING_VALUE;

        // when
        const promise = campaignValidator.validate(campaign);

        // then
        return expect(promise).to.be.rejectedWith(EntityValidationError)
          .then((entityValidationErrors) => expect(entityValidationErrors.invalidAttributes).to.have.lengthOf(3));
      });

    });
  });
});
