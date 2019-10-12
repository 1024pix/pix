const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/certification-profile-serializer');
const CertificationProfile = require('../../../../../lib/domain/models/CertificationProfile');
const UserCompetence = require('../../../../../lib/domain/models/UserCompetence');

describe('Unit | Serializer | JSONAPI | certification-profile-serializer', function() {

  describe('#serialize()', function() {

    it('should convert a CertificationProfile model object into JSON API data', function() {
      // given
      const userCompetence1 = new UserCompetence({ estimatedLevel: 5 });
      const userCompetence2 = new UserCompetence({ estimatedLevel: 2 });
      const userCompetence3 = new UserCompetence({ estimatedLevel: 1 });
      const userCompetence4 = new UserCompetence({ estimatedLevel: 4 });
      const userCompetence5 = new UserCompetence({ estimatedLevel: 5 });
      const certificationProfile = new CertificationProfile({
        userCompetences: [userCompetence1, userCompetence2, userCompetence3, userCompetence4, userCompetence5],
      });

      // when
      const json = serializer.serialize(certificationProfile);

      // then
      expect(json).to.deep.equal({
        data: {
          type: 'certificationProfiles',
          attributes: {
            'is-certifiable': certificationProfile.isCertifiable(),
          }
        }
      });
    });
  });
});
