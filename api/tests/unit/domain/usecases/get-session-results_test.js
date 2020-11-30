const { expect, sinon, domainBuilder } = require('../../../test-helper');
const cleaCertificationStatusRepository = require('../../../../lib/infrastructure/repositories/clea-certification-status-repository');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const assessmentResultRepository = require('../../../../lib/infrastructure/repositories/assessment-result-repository');
const getSessionResults = require('../../../../lib/domain/usecases/get-session-results');

describe('Unit | Domain | Use Cases | get-session-results', () => {

  const sessionWith2Candidates = domainBuilder.buildSession({ date: '2020/01/01', time: '12:00' });
  const sessionId = sessionWith2Candidates.id;
  const certificationCourseRepository = {};
  const sessionRepositoryStub = {};
  const certifCourse1 = domainBuilder.buildCertificationCourse();
  const certifCourse2 = domainBuilder.buildCertificationCourse();
  const certifCourse3 = domainBuilder.buildCertificationCourse();

  const cleaCertifications = [ 'acquired', 'rejected', 'not_passed'];
  const assessmentsIds = [ 1, 2, 3 ];

  const assessmentResult1 = domainBuilder.buildAssessmentResult({ pixScore: 500, competenceMarks: [], createdAt: 'lundi', assessmentId: assessmentsIds[0] });
  const assessmentResult2 = domainBuilder.buildAssessmentResult({ pixScore: 10, competenceMarks: [], createdAt: 'mardi', assessmentId: assessmentsIds[1], commentForCandidate: 'Son ordinateur a explosé' });
  const assessmentResult3 = domainBuilder.buildAssessmentResult({ pixScore: 400, competenceMarks: [], createdAt: 'mercredi', assessmentId: assessmentsIds[2] });

  const firstCertifResult = _buildCertificationResult(certifCourse1, assessmentResult1, cleaCertifications[0]);
  const secondCertifResult = _buildCertificationResult(certifCourse2, assessmentResult2, cleaCertifications[1]);
  const thirdCertifResult = _buildCertificationResult(certifCourse3, assessmentResult3, cleaCertifications[2]);

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
    const { certificationResults } = await getSessionResults({
      sessionId,
      sessionRepository: sessionRepositoryStub,
      certificationCourseRepository,
    });

    // then
    const expectedCertifResults = [ firstCertifResult, secondCertifResult, thirdCertifResult ];
    expect(certificationResults).to.deep.equal(expectedCertifResults);
  });

  it('should return the session', async () => {
    // when
    const { session } = await getSessionResults({
      sessionId,
      sessionRepository: sessionRepositoryStub,
      certificationCourseRepository,
    });

    // then
    const expectedSession = sessionWith2Candidates;
    expect(session).to.deep.equal(expectedSession);
  });

  it('should return the fileName', async () => {
    // when
    const { fileName } = await getSessionResults({
      sessionId,
      sessionRepository: sessionRepositoryStub,
      certificationCourseRepository,
    });

    // then
    const expectedFileName = `20200101_1200_resultats_session_${sessionId}.csv`;
    expect(fileName).to.deep.equal(expectedFileName);
  });

});

function _buildCertificationResult(certifCourse, lastAssessmentResult, cleaCertification) {
  return domainBuilder.buildCertificationResult({
    ...certifCourse,
    examinerComment: certifCourse.certificationIssueReports[0].description,
    lastAssessmentResult,
    assessmentId: lastAssessmentResult.assessmentId,
    cleaCertificationStatus: cleaCertification,
    competencesWithMark: [],
  });
}
