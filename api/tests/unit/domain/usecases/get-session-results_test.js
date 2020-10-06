const { expect, sinon, domainBuilder } = require('../../../test-helper');
const cleaCertificationStatusRepository = require('../../../../lib/infrastructure/repositories/clea-certification-status-repository');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const assessmentResultRepository = require('../../../../lib/infrastructure/repositories/assessment-result-repository');
const getSessionResults = require('../../../../lib/domain/usecases/get-session-results');

describe('Unit | Domain | Use Cases | get-session-results', () => {

  const sessionWith2Candidates = domainBuilder.buildSession();
  const sessionId = sessionWith2Candidates.id;
  const certificationCourseRepository = {};
  const sessionRepositoryStub = {};
  const certifCourse1 = domainBuilder.buildCertificationCourse();
  const certifCourse2 = domainBuilder.buildCertificationCourse();
  const certifCourse3 = domainBuilder.buildCertificationCourse();

  const cleaCertifications = [ 'acquired', 'rejected', 'not_passed'];
  const assessmentsIds = [ 1, 2, 3 ];

  const assessmentResult1 = domainBuilder.buildAssessmentResult({ pixScore: 500, competenceMarks: [], createdAt: 'lundi' });
  const assessmentResult2 = domainBuilder.buildAssessmentResult({ pixScore: 10, competenceMarks: [], createdAt: 'mardi', commentForCandidate: 'Son ordinateur a explosé' });
  const assessmentResult3 = domainBuilder.buildAssessmentResult({ pixScore: 400, competenceMarks: [], createdAt: 'mercredi' });

  const firstCertifResult = domainBuilder.buildCertificationResult({
    ...certifCourse1,
    assessmentId: assessmentResult1.assessmentId,
    pixScore: 500,
    commentForCandidate: assessmentResult1.commentForCandidate,
    commentForJury: assessmentResult1.commentForJury,
    commentForOrganization: assessmentResult1.commentForOrganization,
    emitter: assessmentResult1.emitter,
    resultCreatedAt: assessmentResult1.createdAt,
    juryId: assessmentResult1.juryId,
    status: assessmentResult1.status,
    cleaCertificationStatus: cleaCertifications[0],
    competencesWithMark: [],
  });
  const secondCertifResult = domainBuilder.buildCertificationResult({
    ...certifCourse2,
    assessmentId: assessmentResult2.assessmentId,
    pixScore: 10,
    commentForCandidate: assessmentResult2.commentForCandidate,
    commentForJury: assessmentResult2.commentForJury,
    commentForOrganization: assessmentResult2.commentForOrganization,
    emitter: assessmentResult2.emitter,
    resultCreatedAt: assessmentResult2.createdAt,
    juryId: assessmentResult2.juryId,
    status: assessmentResult2.status,
    cleaCertificationStatus: cleaCertifications[1],
    competencesWithMark: [],
  });
  const thirdCertifResult = domainBuilder.buildCertificationResult({
    ...certifCourse3,
    assessmentId: assessmentResult3.assessmentId,
    pixScore: 400,
    commentForCandidate: assessmentResult3.commentForCandidate,
    commentForJury: assessmentResult3.commentForJury,
    commentForOrganization: assessmentResult3.commentForOrganization,
    emitter: assessmentResult3.emitter,
    resultCreatedAt: assessmentResult3.createdAt,
    juryId: assessmentResult3.juryId,
    status: assessmentResult3.status,
    cleaCertificationStatus: cleaCertifications[2],
    competencesWithMark: [],
  });

  beforeEach(() => {
    // given
    sessionRepositoryStub.get = sinon.stub().withArgs(sessionId).resolves(sessionWith2Candidates);

    certificationCourseRepository.findCertificationCoursesBySessionId = sinon.stub().withArgs({ sessionId }).resolves([certifCourse1, certifCourse2, certifCourse3]);

    const cleaCertificationStatusRepositoryStub = sinon.stub(cleaCertificationStatusRepository, 'getCleaCertificationStatus');
    cleaCertificationStatusRepositoryStub.withArgs(certifCourse1.id).resolves(cleaCertifications[0]);
    cleaCertificationStatusRepositoryStub.withArgs(certifCourse2.id).resolves(cleaCertifications[1]);
    cleaCertificationStatusRepositoryStub.withArgs(certifCourse3.id).resolves(cleaCertifications[2]);

    const assessmentRepositoryStub = sinon.stub(assessmentRepository, 'getIdByCertificationCourseId');
    assessmentRepositoryStub.withArgs(certifCourse1.id).resolves(assessmentsIds[0]);
    assessmentRepositoryStub.withArgs(certifCourse2.id).resolves(assessmentsIds[1]);
    assessmentRepositoryStub.withArgs(certifCourse3.id).resolves(assessmentsIds[2]);

    const assessmentResultRepositoryStub = sinon.stub(assessmentResultRepository, 'findLatestByCertificationCourseIdWithCompetenceMarks');
    assessmentResultRepositoryStub.withArgs({ certificationCourseId: certifCourse1.id }).resolves(assessmentResult1);
    assessmentResultRepositoryStub.withArgs({ certificationCourseId: certifCourse2.id }).resolves(assessmentResult2);
    assessmentResultRepositoryStub.withArgs({ certificationCourseId: certifCourse3.id }).resolves(assessmentResult3);
  });

  it('should return all certification results', async () => {
    // when
    const { session, certificationResults } = await getSessionResults({
      sessionId,
      sessionRepository: sessionRepositoryStub,
      certificationCourseRepository,
    });

    // then
    const expectedSession = sessionWith2Candidates;
    const expectedCertifResults = [ firstCertifResult, secondCertifResult, thirdCertifResult ];
    expect(session).to.deep.equal(expectedSession);
    expect(certificationResults).to.deep.equal(expectedCertifResults);
  });

});
