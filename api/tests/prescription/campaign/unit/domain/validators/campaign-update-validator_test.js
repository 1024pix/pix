import { expect } from '../../../../../test-helper.js';
import * as campaignUpdateValidator from '../../../../../../src/prescription/campaign/domain/validators/campaign-update-validator.js';
import { CampaignTypes } from '../../../../../../src/prescription/shared/domain/constants.js';

const MISSING_VALUE = null;
const EMPTY_VALUE = '';
const UNDEFINED_VALUE = undefined;
const NOT_BOOLEAN_VALUE = 'NOT_BOOLEAN_VALUE';

function _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError) {
  expect(entityValidationErrors.invalidAttributes).to.have.lengthOf(1);
  expect(entityValidationErrors.invalidAttributes[0]).to.deep.equal(expectedError);
}

describe('Unit | Domain | Validators | campaign-validator', function () {
  const campaignOfTypeProfilesCollection = {
    name: 'campagne de collecte de profils',
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    type: CampaignTypes.PROFILES_COLLECTION,
    creatorId: 4,
    organizationId: 12,
    idPixLabel: 'Mail Pro',
    customResultPageButtonText: null,
    customResultPageButtonUrl: null,
    multipleSendings: false,
  };

  const campaignOfTypeAssessment = {
    name: "campagne d'évaluation",
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    type: CampaignTypes.ASSESSMENT,
    title: "Campagne d'évaluation",
    creatorId: 4,
    organizationId: 12,
    idPixLabel: 'Mail Pro',
    targetProfileId: 44,
    customResultPageButtonText: null,
    customResultPageButtonUrl: null,
    multipleSendings: false,
  };

  describe('#validate', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    [campaignOfTypeAssessment, campaignOfTypeProfilesCollection].forEach((campaign) => {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line mocha/no-setup-in-describe
      context(`when campaign is of type ${campaign.type}`, function () {
        context('when validation is successful', function () {
          it('should not throw any error', function () {
            expect(campaignUpdateValidator.validate(campaign)).to.not.throw;
          });

          it('should resolve when idPixLabel is null', function () {
            // when/then
            expect(
              campaignUpdateValidator.validate({
                ...campaign,
                idPixLabel: MISSING_VALUE,
              }),
            ).to.not.throw;
          });

          context('#title', function () {
            it('should resolve when is null', function () {
              // when/then
              expect(
                campaignUpdateValidator.validate({
                  ...campaign,
                  title: MISSING_VALUE,
                }),
              ).to.not.throw;
            });

            it('should resolve when is not provided', function () {
              // when/then
              expect(
                campaignUpdateValidator.validate({
                  ...campaign,
                  title: UNDEFINED_VALUE,
                }),
              ).to.not.throw;
            });
          });

          context('#customResultPageText', function () {
            it('should resolve when is null', function () {
              // when/then
              expect(
                campaignUpdateValidator.validate({
                  ...campaign,
                  customResultPageText: MISSING_VALUE,
                }),
              ).to.not.throw;
            });
          });

          context('#customResultPageButtonText and #customResultPageButtonUrl', function () {
            it('should resolve when both are null', function () {
              // when/then
              expect(
                campaignUpdateValidator.validate({
                  ...campaign,
                  customResultPageButtonText: MISSING_VALUE,
                  customResultPageButtonUrl: MISSING_VALUE,
                }),
              ).to.not.throw;
            });
          });

          context('#customLandingPageText', function () {
            it('should reject with error customResultPageText has more than 5000 char', function () {
              // given
              const expectedError = {
                attribute: 'customLandingPageText',
                message: 'CUSTOM_LANDING_PAGE_TEXT_IS_TOO_LONG',
              };

              try {
                // when
                campaignUpdateValidator.validate({
                  ...campaign,
                  customLandingPageText: 'Gozilla vs Kong'.repeat(335),
                });
                expect.fail('should have thrown an error');
              } catch (entityValidationErrors) {
                // then
                _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
              }
            });
          });
        });

        context('when campaign data validation fails', function () {
          context('#name', function () {
            // given
            const expectedError = {
              attribute: 'name',
              message: 'CAMPAIGN_NAME_IS_REQUIRED',
            };

            it('should reject with error when name is missing', function () {
              try {
                // when
                campaignUpdateValidator.validate({
                  ...campaign,
                  name: MISSING_VALUE,
                });
                expect.fail('should have thrown an error');
              } catch (entityValidationErrors) {
                // then
                _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
              }
            });

            it('should reject with error when name is empty', function () {
              try {
                // when
                campaignUpdateValidator.validate({
                  ...campaign,
                  name: EMPTY_VALUE,
                });
                expect.fail('should have thrown an error');
              } catch (entityValidationErrors) {
                // then
                _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
              }
            });
          });

          context('#creatorId', function () {
            // given
            const expectedError = {
              attribute: 'creatorId',
              message: 'MISSING_CREATOR',
            };

            it('should reject with error when creatorId is missing', function () {
              try {
                // when
                campaignUpdateValidator.validate({
                  ...campaign,
                  creatorId: MISSING_VALUE,
                });
                expect.fail('should have thrown an error');
              } catch (entityValidationErrors) {
                // then
                _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
              }
            });

            it('should reject with error when creatorId is undefined', function () {
              try {
                // when
                campaignUpdateValidator.validate({
                  ...campaign,
                  creatorId: UNDEFINED_VALUE,
                });
                expect.fail('should have thrown an error');
              } catch (entityValidationErrors) {
                // then
                _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
              }
            });
          });

          context('#organizationId', function () {
            // given
            const expectedError = {
              attribute: 'organizationId',
              message: 'MISSING_ORGANIZATION',
            };

            it('should reject with error when organizationId is missing', function () {
              try {
                // when
                campaignUpdateValidator.validate({
                  ...campaign,
                  organizationId: MISSING_VALUE,
                });
                expect.fail('should have thrown an error');
              } catch (entityValidationErrors) {
                // then
                _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
              }
            });

            it('should reject with error when organizationId is undefined', function () {
              try {
                // when
                campaignUpdateValidator.validate({
                  ...campaign,
                  organizationId: UNDEFINED_VALUE,
                });
                expect.fail('should have thrown an error');
              } catch (entityValidationErrors) {
                // then
                _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
              }
            });
          });

          context('#idPixLabel', function () {
            it('should reject with error when idPixLabel is empty', function () {
              // given
              const expectedError = {
                attribute: 'idPixLabel',
                message: 'EXTERNAL_USER_ID_IS_REQUIRED',
              };

              try {
                // when
                campaignUpdateValidator.validate({
                  ...campaign,
                  idPixLabel: EMPTY_VALUE,
                });
                expect.fail('should have thrown an error');
              } catch (entityValidationErrors) {
                // then
                _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
              }
            });

            it('should reject with error when idPixLabel length is under 3 characters', function () {
              // given
              const expectedError = {
                attribute: 'idPixLabel',
                message: 'EXTERNAL_USER_ID_IS_REQUIRED',
              };

              try {
                // when
                campaignUpdateValidator.validate({
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

          context('#type', function () {
            // given
            const expectedError = {
              attribute: 'type',
              message: 'CAMPAIGN_PURPOSE_IS_REQUIRED',
            };

            it('should reject with error when type is a wrong type', function () {
              try {
                // when
                campaignUpdateValidator.validate({
                  ...campaign,
                  type: 'WRONG_TYPE',
                });
                expect.fail('should have thrown an error');
              } catch (entityValidationErrors) {
                // then
                _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
              }
            });

            it('should reject with error when type is undefined', function () {
              try {
                // when
                campaignUpdateValidator.validate({
                  ...campaign,
                  type: UNDEFINED_VALUE,
                });
                expect.fail('should have thrown an error');
              } catch (entityValidationErrors) {
                // then
                _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
              }
            });
          });

          context('#multipleSendings', function () {
            // given
            const expectedRequiredError = {
              attribute: 'multipleSendings',
              message: 'MULTIPLE_SENDINGS_CHOICE_IS_REQUIRED',
            };

            it('should reject with error when multipleSendings not a boolean', function () {
              try {
                // when
                campaignUpdateValidator.validate({
                  ...campaign,
                  multipleSendings: NOT_BOOLEAN_VALUE,
                });
                expect.fail('should have thrown an error');
              } catch (entityValidationErrors) {
                // then
                _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedRequiredError);
              }
            });

            it('should reject with error when multipleSendings is undefined', function () {
              try {
                // when
                campaignUpdateValidator.validate({
                  ...campaign,
                  multipleSendings: UNDEFINED_VALUE,
                });
                expect.fail('should have thrown an error');
              } catch (entityValidationErrors) {
                // then
                _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedRequiredError);
              }
            });
          });

          it('should reject with errors on all fields (but only once by field) when all fields are missing', function () {
            try {
              // when
              campaignUpdateValidator.validate({
                ...campaign,
                name: MISSING_VALUE,
                creatorId: MISSING_VALUE,
                organizationId: MISSING_VALUE,
                multipleSendings: MISSING_VALUE,
              });
              expect.fail('should have thrown an error');
            } catch (entityValidationErrors) {
              // then
              expect(entityValidationErrors.invalidAttributes).to.have.lengthOf(4);
            }
          });

          context('more complex case', function () {
            it('should reject with errors on all fields (but only once by field) when all fields are missing', function () {
              // given
              const campaign = {
                name: MISSING_VALUE,
                code: MISSING_VALUE,
                type: MISSING_VALUE,
                title: MISSING_VALUE,
                idPixLabel: MISSING_VALUE,
                multipleSendings: MISSING_VALUE,
                organizationId: 1,
              };

              try {
                // when
                campaignUpdateValidator.validate(campaign);
                expect.fail('should have thrown an error');
              } catch (entityValidationErrors) {
                // then
                expect(entityValidationErrors.invalidAttributes).to.have.lengthOf(4);
              }
            });
          });
        });
      });
    });

    context('#title', function () {
      it('should reject with error when campaign type is PROFILES_COLLECTION', function () {
        // given
        const expectedError = {
          attribute: 'title',
          message: 'TITLE_OF_PERSONALISED_TEST_IS_NOT_ALLOWED_FOR_PROFILES_COLLECTION_CAMPAIGN',
        };

        try {
          // when
          campaignUpdateValidator.validate({
            ...campaignOfTypeProfilesCollection,
            title: 'Titre du parcours',
          });
          expect.fail('should have thrown an error');
        } catch (entityValidationErrors) {
          // then
          _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
        }
      });

      it('should resolve when campaign type is ASSESSMENT', function () {
        // given
        const campaign = {
          ...campaignOfTypeAssessment,
          title: 'Titre du parcours',
        };

        // when/then
        expect(campaignUpdateValidator.validate(campaign)).to.not.throw;
      });

      it('should reject with error campaign type is ASSESSMENT and title has more than 50 char', function () {
        // given
        const expectedError = {
          attribute: 'title',
          message: 'CAMPAIGN_TITLE_IS_TOO_LONG',
        };

        try {
          // when
          campaignUpdateValidator.validate({
            ...campaignOfTypeAssessment,
            title: 'Karam'.repeat(50),
          });
          expect.fail('should have thrown an error');
        } catch (entityValidationErrors) {
          // then
          _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
        }
      });
    });

    context('#customResultPageText', function () {
      it('should reject with error campaign type is ASSESSMENT and customResultPageText has more than 5000 char', function () {
        // given
        const expectedError = {
          attribute: 'customResultPageText',
          message: 'CUSTOM_RESULT_PAGE_TEXT_IS_TOO_LONG',
        };

        try {
          // when
          campaignUpdateValidator.validate({
            ...campaignOfTypeAssessment,
            customResultPageText: 'Gozilla vs Kong'.repeat(335),
          });
          expect.fail('should have thrown an error');
        } catch (entityValidationErrors) {
          // then
          _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
        }
      });

      it('should reject with error when campaign type is PROFILES_COLLECTION', function () {
        // given
        const expectedError = {
          attribute: 'customResultPageText',
          message: 'CUSTOM_RESULT_PAGE_TEXT_IS_NOT_ALLOWED_FOR_PROFILES_COLLECTION_CAMPAIGN',
        };

        try {
          // when
          campaignUpdateValidator.validate({
            ...campaignOfTypeProfilesCollection,
            customResultPageText: 'some text',
          });
          expect.fail('should have thrown an error');
        } catch (entityValidationErrors) {
          // then
          _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
        }
      });

      it('should resolve when campaign type is ASSESSMENT', function () {
        // given
        const campaign = {
          ...campaignOfTypeAssessment,
          customResultPageText: 'some text',
        };

        // when/then
        expect(campaignUpdateValidator.validate(campaign)).to.not.throw;
      });
    });

    context('#customResultPageButtonText', function () {
      it('should reject with error when campaign type is PROFILES_COLLECTION', function () {
        // given
        const expectedError = {
          attribute: 'customResultPageButtonText',
          message: 'CUSTOM_RESULT_PAGE_BUTTON_TEXT_IS_NOT_ALLOWED_FOR_PROFILES_COLLECTION_CAMPAIGN',
        };

        try {
          // when
          campaignUpdateValidator.validate({
            ...campaignOfTypeProfilesCollection,
            customResultPageButtonText: 'some text',
          });
          expect.fail('should have thrown an error');
        } catch (entityValidationErrors) {
          // then
          _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
        }
      });

      it('should resolve when campaign type is ASSESSMENT', function () {
        // given
        const campaign = {
          ...campaignOfTypeAssessment,
          customResultPageButtonText: 'some text',
          customResultPageButtonUrl: 'http://www.url.com',
        };

        // when/then
        expect(campaignUpdateValidator.validate(campaign)).to.not.throw;
      });

      it('should reject with error when customResultPageButtonText is not filled but customResultPageButtonUrl is', function () {
        // given
        const expectedError = {
          attribute: 'customResultPageButtonText',
          message: 'CUSTOM_RESULT_PAGE_BUTTON_TEXT_IS_REQUIRED_WHEN_CUSTOM_RESULT_PAGE_BUTTON_URL_IS_FILLED',
        };

        try {
          // when
          campaignUpdateValidator.validate({
            ...campaignOfTypeAssessment,
            customResultPageButtonUrl: 'https://www.url.com',
            customResultPageButtonText: EMPTY_VALUE,
          });
          expect.fail('should have thrown an error');
        } catch (entityValidationErrors) {
          // then
          _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
        }
      });

      it('should reject with error when customResultPageButtonText is null but customResultPageButtonUrl is filled', function () {
        // given
        const expectedError = {
          attribute: 'customResultPageButtonText',
          message: 'CUSTOM_RESULT_PAGE_BUTTON_TEXT_IS_REQUIRED_WHEN_CUSTOM_RESULT_PAGE_BUTTON_URL_IS_FILLED',
        };

        try {
          // when
          campaignUpdateValidator.validate({
            ...campaignOfTypeAssessment,
            customResultPageButtonUrl: 'https://www.url.com',
            customResultPageButtonText: MISSING_VALUE,
          });
          expect.fail('should have thrown an error');
        } catch (entityValidationErrors) {
          // then
          _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
        }
      });
    });

    context('#customResultPageButtonUrl', function () {
      it('should reject with error when campaign type is PROFILES_COLLECTION', function () {
        // given
        const expectedError = {
          attribute: 'customResultPageButtonUrl',
          message: 'CUSTOM_RESULT_PAGE_BUTTON_URL_IS_NOT_ALLOWED_FOR_PROFILES_COLLECTION_CAMPAIGN',
        };

        try {
          // when
          campaignUpdateValidator.validate({
            ...campaignOfTypeProfilesCollection,
            customResultPageButtonUrl: 'https://www.url.com',
          });
          expect.fail('should have thrown an error');
        } catch (entityValidationErrors) {
          // then
          _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
        }
      });

      it('should resolve when campaign type is ASSESSMENT', function () {
        // given
        const campaign = {
          ...campaignOfTypeAssessment,
          customResultPageButtonText: 'some text',
          customResultPageButtonUrl: 'https://www.url.com',
        };

        // when/then
        expect(campaignUpdateValidator.validate(campaign)).to.not.throw;
      });

      it('should reject with error when it is not a url', function () {
        // given
        const expectedError = {
          attribute: 'customResultPageButtonUrl',
          message: 'CUSTOM_RESULT_PAGE_BUTTON_URL_MUST_BE_A_URL',
        };

        try {
          // when
          campaignUpdateValidator.validate({
            ...campaignOfTypeAssessment,
            customResultPageButtonText: 'some text',
            customResultPageButtonUrl: 'some text',
          });
          expect.fail('should have thrown an error');
        } catch (entityValidationErrors) {
          // then
          _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
        }
      });

      it('should reject with error when customResultPageButtonUrl is not filled but customResultPageButtonText is', function () {
        // given
        const expectedError = {
          attribute: 'customResultPageButtonUrl',
          message: 'CUSTOM_RESULT_PAGE_BUTTON_URL_IS_REQUIRED_WHEN_CUSTOM_RESULT_PAGE_BUTTON_TEXT_IS_FILLED',
        };

        try {
          // when
          campaignUpdateValidator.validate({
            ...campaignOfTypeAssessment,
            customResultPageButtonUrl: EMPTY_VALUE,
            customResultPageButtonText: 'some text',
          });
          expect.fail('should have thrown an error');
        } catch (entityValidationErrors) {
          // then
          _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
        }
      });

      it('should reject with error when customResultPageButtonUrl is null but customResultPageButtonText is filled', function () {
        // given
        const expectedError = {
          attribute: 'customResultPageButtonUrl',
          message: 'CUSTOM_RESULT_PAGE_BUTTON_URL_IS_REQUIRED_WHEN_CUSTOM_RESULT_PAGE_BUTTON_TEXT_IS_FILLED',
        };

        try {
          // when
          campaignUpdateValidator.validate({
            ...campaignOfTypeAssessment,
            customResultPageButtonUrl: MISSING_VALUE,
            customResultPageButtonText: 'some text',
          });
          expect.fail('should have thrown an error');
        } catch (entityValidationErrors) {
          // then
          _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
        }
      });
    });
  });
});
