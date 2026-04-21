import sinon from 'sinon';

import { findCountries } from '../../../../../src/shared/domain/usecases/find-countries.js';

import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Shared | UseCase | find-country', function () {
  let countryRepository;

  beforeEach(function () {
    countryRepository = {
      findAll: sinon.stub(),
    };
  });

  it('should find the countries', async function () {
    // given
    const countries = [
      domainBuilder.buildCountry({
        code: '1234',
        name: 'TOGO',
      }),
      domainBuilder.buildCountry({
        code: '5678',
        name: 'NABOO',
      }),
    ];
    countryRepository.findAll.resolves(countries);

    // when
    const result = await findCountries({
      countryRepository,
    });

    // then
    expect(result).to.deep.equal(countries);
  });
});
