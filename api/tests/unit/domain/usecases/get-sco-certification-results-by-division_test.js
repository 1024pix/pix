const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const getScoCertificationResultsByDivision = require('../../../../lib/domain/usecases/get-sco-certification-results-by-division');
const { NoCertificationResultForDivision } = require('../../../../lib/domain/errors');
describe('Unit | UseCase | get-sco-certification-results-by-division', () => {
  it('throws when no results is found for organization and division', async () => {
    // given
    const scoCertificationCandidateRepository = { findIdsByOrganizationIdAndDivision: sinon.stub() };
    scoCertificationCandidateRepository.findIdsByOrganizationIdAndDivision.withArgs({
      organizationId: 1,
      division: '3ème A',
    }).resolves([]);
    const certificationCourseRepository = { findCertificationCoursesByCandidateIds: sinon.stub() };
    certificationCourseRepository.findCertificationCoursesByCandidateIds.withArgs({
      candidateIds: [],
    }).resolves([]);

    const dependencies = {
      scoCertificationCandidateRepository,
      certificationCourseRepository,
      getCertificationResultByCertifCourse: undefined,
    };

    // when
    const error = await catchErr(getScoCertificationResultsByDivision)({
      ...dependencies,
      organizationId: 1,
      division: '3ème A',
    });

    // then
    expect(error).to.be.instanceof(NoCertificationResultForDivision);
  });

  it('returns the list of results of candidates matching the organization and division', async () => {
    // given
    const scoCertificationCandidateRepository = { findIdsByOrganizationIdAndDivision: sinon.stub() };
    scoCertificationCandidateRepository.findIdsByOrganizationIdAndDivision.withArgs({
      organizationId: 1,
      division: '3ème A',
    }).resolves([10, 11]);
    const certificationCourseRepository = { findCertificationCoursesByCandidateIds: sinon.stub() };

    const firstMatchingCandidateCertificationCourse = domainBuilder.buildCertificationCourse();
    const firstMatchingCandidateCertificationResult = domainBuilder.buildCertificationResult();
    const secondMatchingCandidateCertificationCourse = domainBuilder.buildCertificationCourse();
    const secondMatchingCandidateCertificationResult = domainBuilder.buildCertificationResult();

    certificationCourseRepository.findCertificationCoursesByCandidateIds.withArgs({
      candidateIds: [10, 11],
    }).resolves([
      firstMatchingCandidateCertificationCourse,
      secondMatchingCandidateCertificationCourse,
    ]);

    const getCertificationResultByCertifCourse = sinon.stub();
    getCertificationResultByCertifCourse.withArgs({ certificationCourse: firstMatchingCandidateCertificationCourse })
      .resolves(firstMatchingCandidateCertificationResult);
    getCertificationResultByCertifCourse.withArgs({ certificationCourse: secondMatchingCandidateCertificationCourse })
      .resolves(secondMatchingCandidateCertificationResult);

    const dependencies = {
      scoCertificationCandidateRepository,
      certificationCourseRepository,
      getCertificationResultByCertifCourse,
    };

    // when
    const certificationResults = await getScoCertificationResultsByDivision({
      ...dependencies,
      organizationId: 1,
      division: '3ème A',
    });

    // then
    expect(certificationResults).to.deep.equal([
      firstMatchingCandidateCertificationResult,
      secondMatchingCandidateCertificationResult,
    ]);
  });

});
