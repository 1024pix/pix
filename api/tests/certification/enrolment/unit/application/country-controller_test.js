import { countryController } from '../../../../../src/certification/enrolment/application/country-controller.js';
import { usecases } from '../../../../../src/certification/enrolment/domain/usecases/index.js';
import {
  domainBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  hFake,
  sinon,
} from '../../../../test-helper.js';

describe('Certification | Enrolment | Unit | Application | country-controller', function () {
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
      sinon.stub(usecases, 'findCountries');

      usecases.findCountries.resolves(countries);
      countrySerializerStub.serialize.withArgs(countries).resolves(serializedCountries);

      const request = {
        params: { id: 'course_id' },
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        pre: { userId },
      };

      // when
      const response = await countryController.findCountries(request, hFake, {
        countrySerializer: countrySerializerStub,
      });

      // then
      expect(usecases.findCountries).to.have.been.called;
      expect(countrySerializerStub.serialize).to.have.been.calledWithExactly(countries);
      expect(response).to.deep.equal(serializedCountries);
    });
  });
});
