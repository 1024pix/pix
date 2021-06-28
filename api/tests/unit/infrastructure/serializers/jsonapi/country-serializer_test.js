const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/country-serializer');
const { domainBuilder } = require('../../../../test-helper');

describe('Unit | Serializer | JSONAPI | country-serializer', () => {

  describe('#serialize', () => {

    it('should convert a Certification CPF Country model object into JSON API data', () => {
      // given
      const countries = [
        domainBuilder.buildCountry({
          code: '123',
          name: 'TOGO',
        }),
        domainBuilder.buildCountry({
          code: '456',
          name: 'NABOO',
        }),
      ];

      // when
      const json = serializer.serialize(countries);

      // then
      expect(json).to.deep.equal({
        data: [
          {
            id: '123',
            type: 'countries',
            attributes: {
              name: 'TOGO',
              code: '123',
            },
          },
          {
            id: '456',
            type: 'countries',
            attributes: {
              name: 'NABOO',
              code: '456',
            },
          },
        ],
      });
    });
  });
});
