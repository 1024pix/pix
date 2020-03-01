const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/demo-serializer');
const Demo = require('../../../../../lib/domain/models/Demo');

describe('Unit | Serializer | JSONAPI | demo-serializer', function() {

  describe('#serialize()', function() {

    it('should convert a Demo model object into JSON API data', function() {
      const demo = new Demo({
        id: 'demo_id',
        name: 'Name of the demo',
        description: 'Description of the demo',
        imageUrl: 'http://image.url',
        type: 'DEMO',
        challenges: [
          'rec_challenge_1',
          'rec_challenge_2',
          'rec_challenge_3',
          'rec_challenge_4',
          'rec_challenge_5'
        ],
      });

      // when
      const json = serializer.serialize(demo);

      // then
      expect(json).to.deep.equal({
        'data': {
          'type': 'courses',
          'id': demo.id,
          'attributes': {
            'name': demo.name,
            'description': demo.description,
            'image-url': 'http://image.url',
            'nb-challenges': 5,
            'type': demo.type
          },
        }
      });
    });

  });

});
