const { expect, factory } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/target-profile-serializer');
const TargetProfile = require('../../../../../lib/domain/models/TargetProfile');

describe('Unit | Serializer | JSONAPI | target-profile-serializer', function() {

  describe('#serialize', function() {

    it('should serialize target profile to JSONAPI', function() {
      // given
      const targetProfile = factory.buildTargetProfile({ id: 132, name: 'Les compétences de BRO 2.0' });

      const expectedTargetProfile = {
        data: {
          id: targetProfile.id,
          type: 'target-profiles',
          attributes: {
            name: targetProfile.name
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
