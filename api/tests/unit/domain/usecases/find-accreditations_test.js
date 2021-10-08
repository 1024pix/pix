const { expect, domainBuilder, sinon } = require('../../../test-helper');
const findAccreditations = require('../../../../lib/domain/usecases/find-accreditations');

describe('Unit | UseCase | find-accreditations', function () {
  let accreditationRepository;

  beforeEach(function () {
    accreditationRepository = {
      findAll: sinon.stub(),
    };
  });

  it('should find the accreditations', async function () {
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
    accreditationRepository.findAll.resolves(accreditations);

    // when
    const result = await findAccreditations({
      accreditationRepository,
    });

    // then
    expect(result).to.deep.equal(accreditations);
  });
});
