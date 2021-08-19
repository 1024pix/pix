const { expect } = require('../../../test-helper');
const campaignValidator = require('../../../../lib/domain/validators/campaign-validator');
const Campaign = require('../../../../lib/domain/models/Campaign');

const MISSING_VALUE = null;
const EMPTY_VALUE = '';
const UNDEFINED_VALUE = undefined;

function _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError) {
  expect(entityValidationErrors.invalidAttributes).to.have.lengthOf(1);
  expect(entityValidationErrors.invalidAttributes[0]).to.deep.equal(expectedError);
}

describe('Unit | Domain | Validators | campaign-validator', function() {

  const campaignOfTypeProfilesCollection = {
    name: 'campagne de collecte de profils',
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    type: Campaign.types.PROFILES_COLLECTION,
    creatorId: 4,
    organizationId: 12,
    idPixLabel: 'Mail Pro',
    customResultPageButtonText: null,
    customResultPageButtonUrl: null,
  };

  const campaignOfTypeAssessment = {
    name: 'campagne d\'évaluation',
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    type: Campaign.types.ASSESSMENT,
    title: 'Campagne d\'évaluation',
    creatorId: 4,
    organizationId: 12,
    idPixLabel: 'Mail Pro',
    targetProfileId: 44,
    customResultPageButtonText: null,
    customResultPageButtonUrl: null,
  };

  describe('#validate', function() {

    // eslint-disable-next-line mocha/no-setup-in-describe
    [campaignOfTypeAssessment, campaignOfTypeProfilesCollection].forEach((campaign) => {

      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line mocha/no-setup-in-describe
      context(`when campaign is of type ${campaign.type}`, function() {
        context('when validation is successful', function() {

          it('should not throw any error', function() {
            expect(campaignValidator.validate(campaign)).to.not.throw;
          });

          it('should resolve when idPixLabel is null', function() {
            // when/then
            expect(campaignValidator.validate({
              ...campaign,
              idPixLabel: MISSING_VALUE,
            })).to.not.throw;
          });

          it('should resolve when title is null', function() {
            // when/then
            expect(campaignValidator.validate({
              ...campaign,
              title: MISSING_VALUE,
            })).to.not.throw;
          });

          it('should resolve when title is not provided', function() {
            // when/then
            expect(campaignValidator.validate({
              ...campaign,
              title: UNDEFINED_VALUE,
            })).to.not.throw;
          });

          it('should resolve when customResultPageText is null', function() {
            // when/then
            expect(campaignValidator.validate({
              ...campaign,
              customResultPageText: MISSING_VALUE,
            })).to.not.throw;
          });

          it('should resolve when customResultPageButtonText and customResultPageButtonUrl are null', function() {
            // when/then
            expect(campaignValidator.validate({
              ...campaign,
              customResultPageButtonText: MISSING_VALUE,
              customResultPageButtonUrl: MISSING_VALUE,
            })).to.not.throw;
          });
        });

        context('when campaign data validation fails', function() {

          context('on name attribute', function() {
            // given
            const expectedError = {
              attribute: 'name',
              message: 'CAMPAIGN_NAME_IS_REQUIRED',
            };

            it('should reject with error when name is missing', function() {
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

            it('should reject with error when name is empty', function() {
              try {
                // when
                campaignValidator.validate({
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

          context('on creatorId attribute', function() {
            // given
            const expectedError = {
              attribute: 'creatorId',
              message: 'MISSING_CREATOR',
            };

            it('should reject with error when creatorId is missing', function() {
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

            it('should reject with error when creatorId is undefined', function() {
              try {
                // when
                campaignValidator.validate({
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

          context('on organizationId attribute', function() {
            // given
            const expectedError = {
              attribute: 'organizationId',
              message: 'MISSING_ORGANIZATION',
            };

            it('should reject with error when organizationId is missing', function() {
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

            it('should reject with error when organizationId is undefined', function() {
              try {
                // when
                campaignValidator.validate({
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

          context('on idPixLabel attribute', function() {
            it('should reject with error when idPixLabel is empty', function() {
              // given
              const expectedError = {
                attribute: 'idPixLabel',
                message: 'EXTERNAL_USER_ID_IS_REQUIRED',
              };

              try {
                // when
                campaignValidator.validate({
                  ...campaign,
                  idPixLabel: EMPTY_VALUE,
                });
                expect.fail('should have thrown an error');

              } catch (entityValidationErrors) {
                // then
                _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
              }
            });

            it('should reject with error when idPixLabel length is under 3 characters', function() {
              // given
              const expectedError = {
                attribute: 'idPixLabel',
                message: 'EXTERNAL_USER_ID_IS_REQUIRED',
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

          context('on type attribute', function() {
            // given
            const expectedError = {
              attribute: 'type',
              message: 'CAMPAIGN_PURPOSE_IS_REQUIRED',
            };

            it('should reject with error when type is a wrong type', function() {
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

            it('should reject with error when type is undefined', function() {
              try {
                // when
                campaignValidator.validate({
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

          it('should reject with errors on all fields (but only once by field) when all fields are missing', function() {
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

          context('more complex case', function() {
            it('should reject with errors on all fields (but only once by field) when all fields are missing', function() {
              // given
              const campaign = {
                name: MISSING_VALUE,
                code: MISSING_VALUE,
                type: MISSING_VALUE,
                title: MISSING_VALUE,
                idPixLabel: MISSING_VALUE,
                organizationId: 1,
              };

              try {
                // when
                campaignValidator.validate(campaign);
                expect.fail('should have thrown an error');

              } catch (entityValidationErrors) {
                // then
                expect(entityValidationErrors.invalidAttributes).to.have.lengthOf(3);
              }
            });
          });

        });
      });
    });

    context('on targetProfileId attribute', function() {

      context('when type is PROFILES_COLLECTION', function() {
        it('should reject with error when targetProfileId is provide', function() {
          // given
          const expectedError = {
            attribute: 'targetProfileId',
            message: 'TARGET_PROFILE_NOT_ALLOWED_FOR_PROFILES_COLLECTION_CAMPAIGN',
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

        it('should be valid with null as targetProfileId', function() {
          try {
            campaignValidator.validate({
              ...campaignOfTypeProfilesCollection,
              targetProfileId: MISSING_VALUE,
            });
          } catch (entityValidationErrors) {
            expect.fail('should be valid when targetProfileId is null');
          }
        });

        it('should be valid when targetProfileId is not provided', function() {
          try {
            campaignValidator.validate({
              ...campaignOfTypeProfilesCollection,
              targetProfileId: UNDEFINED_VALUE,
            });

          } catch (entityValidationErrors) {
            expect.fail('should be valid when targetProfileId is undefined');
          }
        });
      });

      context('when type is ASSESSMENT', function() {
        it('should reject with error when targetProfileId is missing', function() {
          // given
          const expectedError = {
            attribute: 'targetProfileId',
            message: 'TARGET_PROFILE_IS_REQUIRED',
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

        it('should reject with error when targetProfileId is undefined', function() {
          // given
          const expectedError = {
            attribute: 'targetProfileId',
            message: 'TARGET_PROFILE_IS_REQUIRED',
          };

          try {
            // when
            campaignValidator.validate({
              ...campaignOfTypeAssessment,
              targetProfileId: UNDEFINED_VALUE,
            });
            expect.fail('should have thrown an error');

          } catch (entityValidationErrors) {
            // then
            _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
          }
        });
      });
    });

    context('when a title is provided', function() {
      it('should reject with error when campaign type is PROFILES_COLLECTION', function() {
        // given
        const expectedError = {
          attribute: 'title',
          message: 'TITLE_OF_PERSONALISED_TEST_IS_NOT_ALLOWED_FOR_PROFILES_COLLECTION_CAMPAIGN',
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

      it('should resolve when campaign type is ASSESSMENT', function() {
        // given
        const campaign = {
          ...campaignOfTypeAssessment,
          title: 'Titre du parcours',
        };

        // when/then
        expect(campaignValidator.validate(campaign)).to.not.throw;
      });
    });

    context('when a customResultPageText is provided', function() {
      it('should reject with error when campaign type is PROFILES_COLLECTION', function() {
        // given
        const expectedError = {
          attribute: 'customResultPageText',
          message: 'CUSTOM_RESULT_PAGE_TEXT_IS_NOT_ALLOWED_FOR_PROFILES_COLLECTION_CAMPAIGN',
        };

        try {
          // when
          campaignValidator.validate({
            ...campaignOfTypeProfilesCollection,
            customResultPageText: 'some text',
          });
          expect.fail('should have thrown an error');

        } catch (entityValidationErrors) {
          // then
          _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
        }
      });

      it('should resolve when campaign type is ASSESSMENT', function() {
        // given
        const campaign = {
          ...campaignOfTypeAssessment,
          customResultPageText: 'some text',
        };

        // when/then
        expect(campaignValidator.validate(campaign)).to.not.throw;
      });
    });

    context('when a customResultPageButtonText is provided', function() {
      it('should reject with error when campaign type is PROFILES_COLLECTION', function() {
        // given
        const expectedError = {
          attribute: 'customResultPageButtonText',
          message: 'CUSTOM_RESULT_PAGE_BUTTON_TEXT_IS_NOT_ALLOWED_FOR_PROFILES_COLLECTION_CAMPAIGN',
        };

        try {
          // when
          campaignValidator.validate({
            ...campaignOfTypeProfilesCollection,
            customResultPageButtonText: 'some text',
          });
          expect.fail('should have thrown an error');

        } catch (entityValidationErrors) {
          // then
          _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
        }
      });

      it('should resolve when campaign type is ASSESSMENT', function() {
        // given
        const campaign = {
          ...campaignOfTypeAssessment,
          customResultPageButtonText: 'some text',
          customResultPageButtonUrl: 'http://www.url.com',
        };

        // when/then
        expect(campaignValidator.validate(campaign)).to.not.throw;
      });

      it('should reject with error when customResultPageButtonText is not filled but customResultPageButtonUrl is', function() {
        // given
        const expectedError = {
          attribute: 'customResultPageButtonText',
          message: 'CUSTOM_RESULT_PAGE_BUTTON_TEXT_IS_REQUIRED_WHEN_CUSTOM_RESULT_PAGE_BUTTON_URL_IS_FILLED',
        };

        try {
          // when
          campaignValidator.validate({
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

      it('should reject with error when customResultPageButtonText is null but customResultPageButtonUrl is filled', function() {
        // given
        const expectedError = {
          attribute: 'customResultPageButtonText',
          message: 'CUSTOM_RESULT_PAGE_BUTTON_TEXT_IS_REQUIRED_WHEN_CUSTOM_RESULT_PAGE_BUTTON_URL_IS_FILLED',
        };

        try {
          // when
          campaignValidator.validate({
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

    context('when a customResultPageButtonUrl is provided', function() {
      it('should reject with error when campaign type is PROFILES_COLLECTION', function() {
        // given
        const expectedError = {
          attribute: 'customResultPageButtonUrl',
          message: 'CUSTOM_RESULT_PAGE_BUTTON_URL_IS_NOT_ALLOWED_FOR_PROFILES_COLLECTION_CAMPAIGN',
        };

        try {
          // when
          campaignValidator.validate({
            ...campaignOfTypeProfilesCollection,
            customResultPageButtonUrl: 'https://www.url.com',
          });
          expect.fail('should have thrown an error');

        } catch (entityValidationErrors) {
          // then
          _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
        }
      });

      it('should resolve when campaign type is ASSESSMENT', function() {
        // given
        const campaign = {
          ...campaignOfTypeAssessment,
          customResultPageButtonText: 'some text',
          customResultPageButtonUrl: 'https://www.url.com',
        };

        // when/then
        expect(campaignValidator.validate(campaign)).to.not.throw;
      });

      it('should reject with error when it is not a url', function() {
        // given
        const expectedError = {
          attribute: 'customResultPageButtonUrl',
          message: 'CUSTOM_RESULT_PAGE_BUTTON_URL_MUST_BE_A_URL',
        };

        try {
          // when
          campaignValidator.validate({
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

      it('should reject with error when customResultPageButtonUrl is not filled but customResultPageButtonText is', function() {
        // given
        const expectedError = {
          attribute: 'customResultPageButtonUrl',
          message: 'CUSTOM_RESULT_PAGE_BUTTON_URL_IS_REQUIRED_WHEN_CUSTOM_RESULT_PAGE_BUTTON_TEXT_IS_FILLED',
        };

        try {
          // when
          campaignValidator.validate({
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

      it('should reject with error when customResultPageButtonUrl is null but customResultPageButtonText is filled', function() {
        // given
        const expectedError = {
          attribute: 'customResultPageButtonUrl',
          message: 'CUSTOM_RESULT_PAGE_BUTTON_URL_IS_REQUIRED_WHEN_CUSTOM_RESULT_PAGE_BUTTON_TEXT_IS_FILLED',
        };

        try {
          // when
          campaignValidator.validate({
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
