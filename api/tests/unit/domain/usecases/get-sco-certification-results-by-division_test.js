const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const getScoCertificationResultsByDivision = require('../../../../lib/domain/usecases/get-sco-certification-results-by-division');
const { NoCertificationResultForDivision } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-sco-certification-results-by-division', function() {
  const scoCertificationCandidateRepository = { findIdsByOrganizationIdAndDivision: null };
  const certificationResultRepository = { findByCertificationCandidateIds: null };
  const dependencies = {
    scoCertificationCandidateRepository,
    certificationResultRepository,
  };

  beforeEach(function() {
    scoCertificationCandidateRepository.findIdsByOrganizationIdAndDivision = sinon.stub();
    certificationResultRepository.findByCertificationCandidateIds = sinon.stub();
  });

  it('throws when no published results is found for organization and division', async function() {
    // given
    scoCertificationCandidateRepository.findIdsByOrganizationIdAndDivision.withArgs({
      organizationId: 1,
      division: '3ème A',
    }).resolves([]);
    certificationResultRepository.findByCertificationCandidateIds.withArgs({
      certificationCandidateIds: [],
    }).resolves([]);

    // when
    const error = await catchErr(getScoCertificationResultsByDivision)({
      ...dependencies,
      organizationId: 1,
      division: '3ème A',
    });

    // then
    expect(error).to.be.instanceof(NoCertificationResultForDivision);
  });

  it('returns the published certification results of candidates matching the organization and division', async function() {
    // given
    scoCertificationCandidateRepository.findIdsByOrganizationIdAndDivision.withArgs({
      organizationId: 1,
      division: '3ème A',
    }).resolves([11, 12, 13]);
    const certificationResultA = domainBuilder.buildCertificationResult({ firstName: 'Buffy', isPublished: true });
    const certificationResultB = domainBuilder.buildCertificationResult({ firstName: 'Giles', isPublished: false });
    const certificationResultC = domainBuilder.buildCertificationResult({ firstName: 'Anyanka', isPublished: true });
    certificationResultRepository.findByCertificationCandidateIds.withArgs({
      certificationCandidateIds: [11, 12, 13],
    }).resolves([certificationResultA, certificationResultB, certificationResultC]);

    // when
    const publishedCertificationResults = await getScoCertificationResultsByDivision({
      ...dependencies,
      organizationId: 1,
      division: '3ème A',
    });

    // then
    expect(publishedCertificationResults).to.deepEqualArray([certificationResultA, certificationResultC]);
  });
});
