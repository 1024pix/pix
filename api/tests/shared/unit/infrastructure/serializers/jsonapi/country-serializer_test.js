import { countrySerializer } from '../../../../../../src/shared/infrastructure/serializers/jsonapi/country-serializer.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Shared | Serializers | country-serializer', function () {
  describe('#serialize', function () {
    it('should convert a Certification CPF Country model object into JSON API data', function () {
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
      const json = countrySerializer.serialize(countries);

      // then
      expect(json).to.deep.equal({
        data: [
          {
            id: '123_GOOT',
            type: 'countries',
            attributes: {
              name: 'TOGO',
              code: '123',
            },
          },
          {
            id: '456_ABNOO',
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
