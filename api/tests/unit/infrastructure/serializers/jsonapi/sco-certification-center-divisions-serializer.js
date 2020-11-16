const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/sco-certification-center-division-serializer');

describe('Unit | Serializer | JSONAPI | sco-certification-center-divisions-serializer', () => {

  describe('#serialize', () => {

    it('should convert divisions array into JSON API data', () => {
      // given
      const divisionList = [
        { name: '3A', id: '3A' },
        { name: '3B', id: '3B' },
        { name: '4C', id: '4C' },
      ];
      const expectedJSON = {
        data: [
          {
            'type': 'divisions',
            'id': '3A',
            'attributes': {
              'name': '3A',
            },
          },
          {
            'type': 'divisions',
            'id': '3B',
            'attributes': {
              'name': '3B',
            },
          },
          {
            'type': 'divisions',
            'id': '4C',
            'attributes': {
              'name': '4C',
            },
          },
        ],
      };

      // when
      const json = serializer.serialize(divisionList);

      // then
      expect(json).to.deep.equal(expectedJSON);
    });
  });
});
