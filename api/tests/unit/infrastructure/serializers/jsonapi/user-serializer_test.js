const { expect } = require('../../../../test-helper');

const User = require('../../../../../lib/domain/models/User');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/user-serializer');

describe('Unit | Serializer | JSONAPI | user-serializer', () => {

  describe('#serialize', () => {

    let userModelObject;

    beforeEach(() => {
      userModelObject = new User({
        id: '234567',
        firstName: 'Luke',
        lastName: 'Skywalker',
        email: 'lskywalker@deathstar.empire',
        username: 'luke.skywalker1234',
        cgu: true,
        mustValidateTermsOfService: true,
        pixOrgaTermsOfServiceAccepted: false,
        pixCertifTermsOfServiceAccepted: false,
        hasSeenAssessmentInstructions: false,
        password: 'Password123',
      });
    });

    describe('when user has no userOrgaSettings', () => {

      it('should serialize excluding password', () => {
        // given
        const expectedSerializedUser = {
          data: {
            type: 'users',
            id: userModelObject.id,
            attributes: {
              'first-name': userModelObject.firstName,
              'last-name': userModelObject.lastName,
              'email': userModelObject.email,
              'username': userModelObject.username,
              'cgu': userModelObject.cgu,
              'must-validate-terms-of-service': userModelObject.mustValidateTermsOfService,
              'pix-orga-terms-of-service-accepted': userModelObject.pixOrgaTermsOfServiceAccepted,
              'pix-certif-terms-of-service-accepted': userModelObject.pixCertifTermsOfServiceAccepted,
              'has-seen-assessment-instructions': userModelObject.hasSeenAssessmentInstructions,
            },
            relationships: {
              memberships: {
                links: {
                  related: `/api/users/${userModelObject.id}/memberships`
                }
              },
              'certification-center-memberships': {
                links: {
                  related: `/api/users/${userModelObject.id}/certification-center-memberships`
                }
              },
              'pix-score': {
                links: {
                  related: `/api/users/${userModelObject.id}/pixscore`
                }
              },
              scorecards: {
                links: {
                  related: `/api/users/${userModelObject.id}/scorecards`
                }
              },
              'campaign-participations': {
                links: {
                  related: `/api/users/${userModelObject.id}/campaign-participations`
                }
              },
              'certification-profile': {
                links: {
                  related: `/api/users/${userModelObject.id}/certification-profile`
                }
              }
            }
          }
        };

        // when
        const json = serializer.serialize(userModelObject);

        // then
        expect(json).to.be.deep.equal(expectedSerializedUser);
      });
    });

    describe('when user has an userOrgaSettings', () => {

      it('should serialize excluding password', () => {
        // given
        userModelObject.userOrgaSettings = {};

        const expectedSerializedUser = {
          data: {
            type: 'users',
            id: userModelObject.id,
            attributes: {
              'first-name': userModelObject.firstName,
              'last-name': userModelObject.lastName,
              'email': userModelObject.email,
              'username': userModelObject.username,
              'cgu': userModelObject.cgu,
              'must-validate-terms-of-service': userModelObject.mustValidateTermsOfService,
              'pix-orga-terms-of-service-accepted': userModelObject.pixOrgaTermsOfServiceAccepted,
              'pix-certif-terms-of-service-accepted': userModelObject.pixCertifTermsOfServiceAccepted,
              'has-seen-assessment-instructions': userModelObject.hasSeenAssessmentInstructions,
            },
            relationships: {
              memberships: {
                links: {
                  related: `/api/users/${userModelObject.id}/memberships`
                }
              },
              'certification-center-memberships': {
                links: {
                  related: `/api/users/${userModelObject.id}/certification-center-memberships`
                }
              },
              'pix-score': {
                links: {
                  related: `/api/users/${userModelObject.id}/pixscore`
                }
              },
              scorecards: {
                links: {
                  related: `/api/users/${userModelObject.id}/scorecards`
                }
              },
              'campaign-participations': {
                links: {
                  related: `/api/users/${userModelObject.id}/campaign-participations`
                }
              },
              'certification-profile': {
                links: {
                  related: `/api/users/${userModelObject.id}/certification-profile`
                }
              },
              'user-orga-settings': {
                links: {
                  related: `/api/users/${userModelObject.id}/user-orga-settings`
                }
              },
            }
          }
        };

        // when
        const json = serializer.serialize(userModelObject);

        // then
        expect(json).to.be.deep.equal(expectedSerializedUser);
      });
    });
  });

  describe('#deserialize()', () => {

    let jsonUser;

    beforeEach(() => {
      jsonUser = {
        data: {
          type: 'user',
          attributes: {
            'first-name': 'Luke',
            'last-name': 'Skywalker',
            email: 'lskywalker@deathstar.empire',
            password: ''
          },
          relationships: {}
        }
      };
    });

    it('should convert JSON API data into an User model object', () => {
      // when
      const user = serializer.deserialize(jsonUser);

      // then
      expect(user).to.be.an.instanceOf(User);
      expect(user.firstName).to.equal('Luke');
      expect(user.lastName).to.equal('Skywalker');
      expect(user.email).to.equal('lskywalker@deathstar.empire');
      expect(user.password).to.equal('');
    });

    it('should contain an ID attribute', () => {
      jsonUser.data.id = '42';

      // when
      const user = serializer.deserialize(jsonUser);

      // then
      expect(user.id).to.equal('42');
    });

    it('should not contain an ID attribute when not given', () => {
      // when
      const user = serializer.deserialize(jsonUser);

      // then
      expect(user.id).to.be.undefined;
    });
  });

});
