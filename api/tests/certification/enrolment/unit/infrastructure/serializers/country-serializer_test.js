import * as serializer from '../../../../../../src/certification/enrolment/infrastructure/serializers/country-serializer.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Certification | Enrolment | Unit | Serializers | country-serializer', function () {
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
      const json = serializer.serialize(countries);

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
