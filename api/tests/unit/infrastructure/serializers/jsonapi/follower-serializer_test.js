const {describe, it, expect} = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/follower-serializer');
const Follower = require('../../../../../lib/domain/models/data/follower');

describe('Unit | Serializer | follower-serializer', function() {
  describe('#deserialize', function() {
    it('should convert JSON API data into a Follower model object', function() {
      const followerModelObject = new Follower({email: 'brm+1@pix.fr'});
      const jsonFollower = {
        data: {
          attributes: {
            email: 'brm+1@pix.fr'
          },
          type: 'followers'
        }
      };

      // when
      const followerObject = serializer.deserialize(jsonFollower);

      // then
      expect(followerObject.get('email')).to.deep.equal(followerModelObject.get('email'));
    });

  });

  describe('#serialize', function() {
    it('should convert Follower Model Object into a JSON API', function() {
      const followerObject = new Follower({email: 'shi@fu.me', id: '1'});
      const jsonApiFollower = {
        data: {
          type: 'followers',
          id: '1',
          attributes: {
            email: 'shi@fu.me'
          }
        }
      };

      // when
      const result = serializer.serialize(followerObject);

      // then
      expect(result).to.deep.equal(jsonApiFollower);
    });

  });

});
