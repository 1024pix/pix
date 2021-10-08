const { expect, domainBuilder, sinon } = require('../../../test-helper');
const findCountries = require('../../../../lib/domain/usecases/find-countries');

describe('Unit | UseCase | find-country', function () {
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
