const { expect, sinon, domainBuilder } = require('../../../test-helper');
const getCpfCertificationResults = require('../../../../lib/domain/usecases/get-cpf-certification-results');

describe('Unit | UseCase | get-cpf-certification-results', function () {
  let cpfCertificationResultRepository;

  beforeEach(function () {
    cpfCertificationResultRepository = {
      findByTimeRange: sinon.stub(),
    };
  });

  it('should return cpf certification results', async function () {
    // given
    const startDate = new Date('2022-01-01');
    const endDate = new Date('2022-01-10');

    const expectedCpfCertificationResults = [
      domainBuilder.buildCpfCertificationResult(),
      domainBuilder.buildCpfCertificationResult(),
      domainBuilder.buildCpfCertificationResult(),
    ];

    cpfCertificationResultRepository.findByTimeRange
      .withArgs({ startDate, endDate })
      .resolves(expectedCpfCertificationResults);

    // when
    const cpfCertificationResults = await getCpfCertificationResults({
      startDate,
      endDate,
      cpfCertificationResultRepository,
    });

    // then
    expect(cpfCertificationResults).to.deepEqualArray(expectedCpfCertificationResults);
  });
});
