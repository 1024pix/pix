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

    it('should serialize excluding email and password', () => {
      // given
      const modelObject = new User({
        id: '234567',
        firstName: 'Luke',
        lastName: 'Skywalker',
        email: 'lskywalker@deathstar.empire',
        cgu: true,
        isProfileV2: false,
        pixOrgaTermsOfServiceAccepted: false,
        pixCertifTermsOfServiceAccepted: false,
        hasSeenMigrationModal: false,
        password: '',
        organizations: [],
        hasSeenMigration: false,
        isMigratedToV2: false,
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
            'cgu': true,
            'is-profile-v2': false,
            'pix-orga-terms-of-service-accepted': false,
            'pix-certif-terms-of-service-accepted': false,
            'has-seen-migration-modal': false,
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
            organizations: {
              data: []
            },
          }
        }
      });
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
