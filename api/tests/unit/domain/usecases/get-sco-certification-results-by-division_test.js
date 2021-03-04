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

  it('throws when no certification course is published', async () => {
    // given
    const scoCertificationCandidateRepository = { findIdsByOrganizationIdAndDivision: sinon.stub() };
    scoCertificationCandidateRepository.findIdsByOrganizationIdAndDivision.withArgs({
      organizationId: 1,
      division: '3ème A',
    }).resolves([10, 11, 12]);
    const certificationCourseRepository = { findCertificationCoursesByCandidateIds: sinon.stub() };

    const unPublishedFirstMatchingCandidateCertificationCourse = domainBuilder.buildCertificationCourse({ isPublished: false });
    const unPublishedSecondMatchingCandidateCertificationCourse = domainBuilder.buildCertificationCourse({ isPublished: false });
    const unPublishedThirdMatchingCandidateCertificationCourse = domainBuilder.buildCertificationCourse({ isPublished: false });

    certificationCourseRepository.findCertificationCoursesByCandidateIds.withArgs({
      candidateIds: [10, 11, 12],
    }).resolves([
      unPublishedFirstMatchingCandidateCertificationCourse,
      unPublishedSecondMatchingCandidateCertificationCourse,
      unPublishedThirdMatchingCandidateCertificationCourse,
    ]);

    const dependencies = {
      scoCertificationCandidateRepository,
      certificationCourseRepository,
      getCertificationResultByCertifCourse: sinon.stub(),
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
    }).resolves([10, 11, 12]);
    const certificationCourseRepository = { findCertificationCoursesByCandidateIds: sinon.stub() };

    const publishedFirstMatchingCandidateCertificationCourse = domainBuilder.buildCertificationCourse({ isPublished: true });
    const publishedFirstMatchingCandidateCertificationResult = domainBuilder.buildCertificationResult();
    const publishedSecondMatchingCandidateCertificationCourse = domainBuilder.buildCertificationCourse({ isPublished: true });
    const publishedSecondMatchingCandidateCertificationResult = domainBuilder.buildCertificationResult();
    const unPublishedThirdMatchingCandidateCertificationCourse = domainBuilder.buildCertificationCourse({ isPublished: false });

    certificationCourseRepository.findCertificationCoursesByCandidateIds.withArgs({
      candidateIds: [10, 11, 12],
    }).resolves([
      publishedFirstMatchingCandidateCertificationCourse,
      publishedSecondMatchingCandidateCertificationCourse,
      unPublishedThirdMatchingCandidateCertificationCourse,
    ]);

    const getCertificationResultByCertifCourse = sinon.stub();
    getCertificationResultByCertifCourse.withArgs({ certificationCourse: publishedFirstMatchingCandidateCertificationCourse })
      .resolves(publishedFirstMatchingCandidateCertificationResult);
    getCertificationResultByCertifCourse.withArgs({ certificationCourse: publishedSecondMatchingCandidateCertificationCourse })
      .resolves(publishedSecondMatchingCandidateCertificationResult);

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
      publishedFirstMatchingCandidateCertificationResult,
      publishedSecondMatchingCandidateCertificationResult,
    ]);
  });

});
