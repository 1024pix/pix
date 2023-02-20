import { expect, hFake, sinon, generateValidRequestAuthorizationHeader, domainBuilder } from '../../../test-helper';

import usecases from '../../../../lib/domain/usecases';
import countrySerializer from '../../../../lib/infrastructure/serializers/jsonapi/country-serializer';
import countryController from '../../../../lib/application/countries/country-controller';

describe('Unit | Controller | country-controller', function () {
  describe('#findCountries', function () {
    it('should fetch and return the countries, serialized as JSONAPI', async function () {
      // given
      const countries = [
        domainBuilder.buildCountry({ code: '99345', name: 'Pologne' }),
        domainBuilder.buildCountry({ code: '99324', name: 'Espagne' }),
      ];

      const serializedCountries = [
        {
          id: '99345',
          type: 'countries',
          attributes: {
            code: '99345',
            name: 'Pologne',
          },
        },
        {
          id: '99324',
          type: 'countries',
          attributes: {
            code: '99324',
            name: 'Espagne',
          },
        },
      ];

      const userId = 42;
      sinon.stub(countrySerializer, 'serialize');
      sinon.stub(usecases, 'findCountries');

      usecases.findCountries.resolves(countries);
      countrySerializer.serialize.withArgs(countries).resolves(serializedCountries);

      const request = {
        params: { id: 'course_id' },
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        pre: { userId },
      };

      // when
      const response = await countryController.findCountries(request, hFake);

      // then
      expect(usecases.findCountries).to.have.been.called;
      expect(countrySerializer.serialize).to.have.been.called;
      expect(countrySerializer.serialize).to.have.been.calledWithExactly(countries);
      expect(response).to.deep.equal(serializedCountries);
    });
  });
});
