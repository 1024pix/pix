const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/target-profile-serializer');
const TargetProfile = require('../../../../../lib/domain/models/TargetProfile');

describe('Unit | Serializer | JSONAPI | target-profile-serializer', function() {

  describe('#serialize', function() {

    it('should serialize target profile to JSONAPI', function() {
      // given
      const targetProfile = new TargetProfile({
        id: '1',
        name: 'Mon super profil cible'
      });

      const expectedTargetProfile = {
        data: {
          id: '1',
          type: 'target-profiles',
          attributes: {
            name: 'Mon super profil cible'
          }
        }
      };

      // when
      const serializedTargetProfile = serializer.serialize(targetProfile);

      // then
      return expect(serializedTargetProfile).to.deep.equal(expectedTargetProfile);
    });

  });

});
