const { expect } = require('../../../../test-helper');
const User = require('../../../../../lib/domain/models/User');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/user-serializer');

describe('Unit | Serializer | JSONAPI | user-serializer', () => {
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

  describe('#serialize', () => {

    describe('when user has no userOrgaSettings', () => {

      it('should serialize excluding password', () => {
        // given
        const modelObject = new User({
          id: '234567',
          firstName: 'Luke',
          lastName: 'Skywalker',
          email: 'lskywalker@deathstar.empire',
          username: 'luke.skywalker1234',
          cgu: true,
          pixOrgaTermsOfServiceAccepted: false,
          pixCertifTermsOfServiceAccepted: false,
          hasSeenAssessmentInstructions: false,
          password: '',
        });

        // when
        const json = serializer.serialize(modelObject);

        // then
        expect(json).to.be.deep.equal({
          data: {
            attributes: {
              'first-name': 'Luke',
              'last-name': 'Skywalker',
              'email': 'lskywalker@deathstar.empire',
              'username': 'luke.skywalker1234',
              'cgu': true,
              'pix-orga-terms-of-service-accepted': false,
              'pix-certif-terms-of-service-accepted': false,
              'has-seen-assessment-instructions': false,
            },
            id: '234567',
            type: 'users',
            relationships: {
              memberships: {
                links: {
                  related: '/api/users/234567/memberships'
                }
              },
              'certification-center-memberships': {
                links: {
                  related: '/api/users/234567/certification-center-memberships'
                }
              },
              'pix-score': {
                links: {
                  related: '/api/users/234567/pixscore'
                }
              },
              scorecards: {
                links: {
                  related: '/api/users/234567/scorecards'
                }
              },
              'campaign-participations': {
                links: {
                  related: '/api/users/234567/campaign-participations'
                }
              },
              'certification-profile': {
                links: {
                  related: '/api/users/234567/certification-profile'
                }
              }
            }
          }
        });
      });
    });

    describe('when user has an userOrgaSettings', () => {

      it('should serialize excluding password', () => {
        // given
        const modelObject = new User({
          id: '234567',
          firstName: 'Luke',
          lastName: 'Skywalker',
          email: 'lskywalker@deathstar.empire',
          username: 'luke.skywalker1234',
          cgu: true,
          pixOrgaTermsOfServiceAccepted: false,
          pixCertifTermsOfServiceAccepted: false,
          hasSeenAssessmentInstructions: false,
          password: '',
        });

        modelObject.userOrgaSettings = {};

        // when
        const json = serializer.serialize(modelObject);

        // then
        expect(json).to.be.deep.equal({
          data: {
            attributes: {
              'first-name': 'Luke',
              'last-name': 'Skywalker',
              'email': 'lskywalker@deathstar.empire',
              'username': 'luke.skywalker1234',
              'cgu': true,
              'pix-orga-terms-of-service-accepted': false,
              'pix-certif-terms-of-service-accepted': false,
              'has-seen-assessment-instructions': false,
            },
            id: '234567',
            type: 'users',
            relationships: {
              memberships: {
                links: {
                  related: '/api/users/234567/memberships'
                }
              },
              'certification-center-memberships': {
                links: {
                  related: '/api/users/234567/certification-center-memberships'
                }
              },
              'user-orga-settings': {
                links: {
                  related: '/api/users/234567/user-orga-settings'
                }
              },
              'pix-score': {
                links: {
                  related: '/api/users/234567/pixscore'
                }
              },
              scorecards: {
                links: {
                  related: '/api/users/234567/scorecards'
                }
              },
              'campaign-participations': {
                links: {
                  related: '/api/users/234567/campaign-participations'
                }
              },
              'certification-profile': {
                links: {
                  related: '/api/users/234567/certification-profile'
                }
              }
            }
          }
        });
      });
    });
  });

  describe('#serializeMinimal', () => {
    const minimalJsonApi = {
      data: {
        id: '1',
        type: 'users',
        attributes: {
          'first-name': 'Luke',
          'last-name': 'Skywalker',
          email: 'lskywalker@deathstar.empire',
        },
      }
    };

    it('should serialize minimal info', () => {
      // given
      const modelObject = new User({
        id: 1,
        firstName: 'Luke',
        lastName: 'Skywalker',
        email: 'lskywalker@deathstar.empire',
      });

      // when
      const json = serializer.serializeMinimal(modelObject);

      // then
      expect(json).to.be.deep.equal(minimalJsonApi);
    });
  });

  describe('#deserialize()', () => {

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
