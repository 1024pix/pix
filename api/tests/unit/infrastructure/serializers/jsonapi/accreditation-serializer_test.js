const { domainBuilder, expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/accreditation-serializer');

describe('Unit | Serializer | JSONAPI | accreditation-serializer', function() {

  describe('#serialize', function() {

    it('should convert an accreditation model object into JSON API data', function() {
      // given
      const accreditations = [
        domainBuilder.buildAccreditation({
          id: 11,
          name: 'Pix+Edu',
        }),
        domainBuilder.buildAccreditation({
          id: 22,
          name: 'Cléa Numérique',
        }),
      ];

      // when
      const json = serializer.serialize(accreditations);

      // then
      expect(json).to.deep.equal({
        data: [
          {
            id: '11',
            type: 'accreditations',
            attributes: {
              name: 'Pix+Edu',
            },
          },
          {
            id: '22',
            type: 'accreditations',
            attributes: {
              name: 'Cléa Numérique',
            },
          },
        ],
      });
    });
  });
});
