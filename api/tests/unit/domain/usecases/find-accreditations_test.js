const { expect, domainBuilder, sinon } = require('../../../test-helper');
const findAccreditations = require('../../../../lib/domain/usecases/find-accreditations');

describe('Unit | UseCase | find-accreditations', function () {
  let complementaryCertificationRepository;

  beforeEach(function () {
    complementaryCertificationRepository = {
      findAll: sinon.stub(),
    };
  });

  it('should find the accreditations', async function () {
    // given
    const complementaryCertifications = [
      domainBuilder.buildAccreditation({
        id: 11,
        name: 'Pix+Edu',
      }),
      domainBuilder.buildAccreditation({
        id: 22,
        name: 'Cléa Numérique',
      }),
    ];
    complementaryCertificationRepository.findAll.resolves(complementaryCertifications);

    // when
    const result = await findAccreditations({
      complementaryCertificationRepository,
    });

    // then
    expect(result).to.deep.equal(complementaryCertifications);
  });
});
