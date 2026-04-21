import sinon from 'sinon';

import { countryController } from '../../../../../src/shared/application/country/country-controller.js';
import { sharedUsecases } from '../../../../../src/shared/domain/usecases/index.js';

import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Unit | Shared | Application | Controller | country-controller', function () {
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
      const countrySerializerStub = { serialize: sinon.stub() };
      sinon.stub(sharedUsecases, 'findCountries');

      sharedUsecases.findCountries.resolves(countries);
      countrySerializerStub.serialize.withArgs(countries).resolves(serializedCountries);

      const request = {
        params: { id: 'course_id' },
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
        pre: { userId },
      };

      // when
      const response = await countryController.findCountries(request, hFake, {
        countrySerializer: countrySerializerStub,
      });

      // then
      expect(sharedUsecases.findCountries).to.have.been.called;
      expect(countrySerializerStub.serialize).to.have.been.calledWithExactly(countries);
      expect(response).to.deep.equal(serializedCountries);
    });
  });
});
