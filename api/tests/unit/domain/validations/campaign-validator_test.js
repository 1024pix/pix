const { expect, domainBuilder } = require('../../../test-helper');
const campaignValidator = require('../../../../lib/domain/validators/campaign-validator');

const MISSING_VALUE = '';

function _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError) {
  expect(entityValidationErrors.invalidAttributes).to.have.lengthOf(1);
  expect(entityValidationErrors.invalidAttributes[0]).to.deep.equal(expectedError);
}

describe('Unit | Domain | Validators | campaign-validator', function() {

  const campaignOfTypeProfilesCollection = domainBuilder.buildCampaign.ofTypeProfilesCollection({
    name: 'campagne de collecte de profils',
    creatorId: 4,
    organizationId: 12,
    idPixLabel: 'Mail Pro',
  });

  const campaignOfTypeAssessment = domainBuilder.buildCampaign.ofTypeAssessment({
    name: 'campagne d\'évaluation',
    title: 'Campagne d\'évaluation',
    creatorId: 4,
    organizationId: 12,
    idPixLabel: 'Mail Pro',
    targetProfileId: 44,
  });

  describe('#validate', () => {

    [campaignOfTypeAssessment, campaignOfTypeProfilesCollection].forEach((campaign) => {

      context(`when campaign is of type ${campaign.type}`, () => {
        context('when validation is successful', () => {

          it('should not throw any error', () => {
            expect(campaignValidator.validate(campaign)).to.not.throw;
          });

          it('should resolve when idPixLabel is null', () => {
            // when/then
            expect(campaignValidator.validate({
              ...campaign,
              idPixLabel: null,
            })).to.not.throw;
          });

          it('should resolve when title is null', () => {
            // when/then
            expect(campaignValidator.validate({
              ...campaign,
              title: null,
            })).to.not.throw;
          });

          it('should resolve when title is not provided', () => {
            // when/then
            expect(campaignValidator.validate({
              ...campaign,
              title: undefined,
            })).to.not.throw;
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

              try {
                // when
                campaignValidator.validate({
                  ...campaign,
                  name: MISSING_VALUE,
                });
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

              try {
                // when
                campaignValidator.validate({
                  ...campaign,
                  creatorId: MISSING_VALUE,
                });
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

              try {
                // when
                campaignValidator.validate({
                  ...campaign,
                  organizationId: MISSING_VALUE,
                });
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

              try {
                // when
                campaignValidator.validate({
                  ...campaign,
                  idPixLabel: MISSING_VALUE,
                });
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

              try {
                // when
                campaignValidator.validate({
                  ...campaign,
                  idPixLabel: 'AZ',
                });
                expect.fail('should have thrown an error');

              } catch (entityValidationErrors) {
                // then
                _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
              }
            });

          });

          context('on type attribute', () => {

            it('should reject with error when type is a wrong type', () => {
              // given
              const expectedError = {
                attribute: 'type',
                message: 'Veuillez choisir l’objectif de votre campagne : Évaluation ou Collecte de profils.'
              };

              try {
                // when
                campaignValidator.validate({
                  ...campaign,
                  type: 'WRONG_TYPE',
                });
                expect.fail('should have thrown an error');
              } catch (entityValidationErrors) {
                // then
                _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
              }
            });
          });

          it('should reject with errors on all fields (but only once by field) when all fields are missing', () => {
            try {
              // when
              campaignValidator.validate({
                ...campaign,
                name: MISSING_VALUE,
                creatorId: MISSING_VALUE,
                organizationId: MISSING_VALUE,
              });
              expect.fail('should have thrown an error');

            } catch (entityValidationErrors) {
              // then
              expect(entityValidationErrors.invalidAttributes).to.have.lengthOf(3);
            }
          });

        });
      });
    });

    context('on targetProfileId attribute', () => {
      it('should reject with error when targetProfileId is provided and campaign type is PROFILES_COLLECTION', () => {
        // given
        const expectedError = {
          attribute: 'targetProfileId',
          message: 'Un profil cible n’est pas autorisé pour les campagnes de collecte de profils.'
        };

        try {
          // when
          campaignValidator.validate({
            ...campaignOfTypeProfilesCollection,
            targetProfileId: '1',
          });
          expect.fail('should have thrown an error');

        } catch (entityValidationErrors) {
          // then
          _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
        }
      });

      it('should reject with error when targetProfileId is missing and campaign type is ASSESSMENT', () => {
        // given
        const expectedError = {
          attribute: 'targetProfileId',
          message: 'Veuillez sélectionner un profil cible pour votre campagne.'
        };

        try {
          // when
          campaignValidator.validate({
            ...campaignOfTypeAssessment,
            targetProfileId: MISSING_VALUE,
          });
          expect.fail('should have thrown an error');

        } catch (entityValidationErrors) {
          // then
          _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
        }
      });

    });

    context('when a title is provided', () => {
      it('should reject with error when campaign type is PROFILES_COLLECTION', () => {
        // given
        const expectedError = {
          attribute: 'title',
          message: 'Le titre du parcours n’est pas autorisé pour les campagnes de collecte de profils.'
        };

        try {
          // when
          campaignValidator.validate({
            ...campaignOfTypeProfilesCollection,
            title: 'Titre du parcours',
          });
          expect.fail('should have thrown an error');

        } catch (entityValidationErrors) {
          // then
          _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
        }
      });

      it('should resolve when campaign type is ASSESSMENT', () => {
        // given
        const campaign = {
          ...campaignOfTypeAssessment,
          title: 'Titre du parcours',
        };

        // when/then
        expect(campaignValidator.validate(campaign)).to.not.throw;
      });
    });
  });
});
