const { expect, sinon, domainBuilder } = require('../../../test-helper');
const cleaCertificationResultRepository = require('../../../../lib/infrastructure/repositories/clea-certification-result-repository');
const pixPlusMaitreCertificationResultRepository = require('../../../../lib/infrastructure/repositories/pix-plus-droit-maitre-certification-result-repository');
const pixPlusExpertCertificationResultRepository = require('../../../../lib/infrastructure/repositories/pix-plus-droit-expert-certification-result-repository');
const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const assessmentResultRepository = require('../../../../lib/infrastructure/repositories/assessment-result-repository');
const getSessionResults = require('../../../../lib/domain/usecases/get-session-results');

describe('Unit | Domain | Use Cases | get-session-results', function() {

  let sessionWith2Candidates;
  let certificationCourseRepository;
  let sessionRepository;

  const assessmentId = 1;
  let certifCourse;
  let assessmentResult;
  let cleaCertificationResultRepositoryStub;
  let pixPlusMaitreCertificationResultRepositoryStub;
  let pixPlusExpertCertificationResultRepositoryStub;
  let assessmentRepositoryStub;
  let assessmentResultRepositoryStub;

  beforeEach(function() {
    cleaCertificationResultRepositoryStub = sinon.stub(cleaCertificationResultRepository, 'get');
    pixPlusMaitreCertificationResultRepositoryStub = sinon.stub(pixPlusMaitreCertificationResultRepository, 'get');
    pixPlusExpertCertificationResultRepositoryStub = sinon.stub(pixPlusExpertCertificationResultRepository, 'get');
    assessmentRepositoryStub = sinon.stub(assessmentRepository, 'getIdByCertificationCourseId');
    assessmentResultRepositoryStub = sinon.stub(assessmentResultRepository, 'findLatestByCertificationCourseIdWithCompetenceMarks');

    sessionWith2Candidates = domainBuilder.buildSession({ date: '2020/01/01', time: '12:00' });

    certifCourse = domainBuilder.buildCertificationCourse({ id: 1 });
    assessmentResult = domainBuilder.buildAssessmentResult({ pixScore: 500, competenceMarks: [], createdAt: 'lundi', assessmentId });

    certificationCourseRepository = {
      findCertificationCoursesBySessionId: sinon.stub(),
    };
    sessionRepository = {
      get: sinon.stub(),
    };

    sessionRepository.get.withArgs(sessionWith2Candidates.id).resolves(sessionWith2Candidates);
  });

  it('should return all certification results', async function() {
    //before
    const assessmentId2 = 2;
    const assessmentId3 = 3;
    const certifCourse2 = domainBuilder.buildCertificationCourse({ id: 2 });
    const assessmentResult2 = domainBuilder.buildAssessmentResult({ pixScore: 10, competenceMarks: [], createdAt: 'mardi', assessmentId: assessmentId2, commentForCandidate: 'Son ordinateur a explosé' });
    const certifCourse3 = domainBuilder.buildCertificationCourse({ id: 3 });
    const assessmentResult3 = domainBuilder.buildAssessmentResult({ pixScore: 400, competenceMarks: [], createdAt: 'mercredi', assessmentId: assessmentId3 });

    const cleaCertificationResults = [
      domainBuilder.buildCleaCertificationResult.acquired(),
      domainBuilder.buildCleaCertificationResult.rejected(),
      domainBuilder.buildCleaCertificationResult.notTaken(),
    ];
    const pixPlusDroitMaitreCertificationResults = [
      domainBuilder.buildPixPlusDroitCertificationResult.maitre.acquired(),
      domainBuilder.buildPixPlusDroitCertificationResult.maitre.rejected(),
      domainBuilder.buildPixPlusDroitCertificationResult.maitre.notTaken(),
    ];
    const pixPlusDroitExpertCertificationResults = [
      domainBuilder.buildPixPlusDroitCertificationResult.expert.acquired(),
      domainBuilder.buildPixPlusDroitCertificationResult.expert.rejected(),
      domainBuilder.buildPixPlusDroitCertificationResult.expert.notTaken(),
    ];

    cleaCertificationResultRepositoryStub.withArgs({ certificationCourseId: certifCourse.getId() }).resolves(cleaCertificationResults[0]);
    cleaCertificationResultRepositoryStub.withArgs({ certificationCourseId: certifCourse2.getId() }).resolves(cleaCertificationResults[1]);
    cleaCertificationResultRepositoryStub.withArgs({ certificationCourseId: certifCourse3.getId() }).resolves(cleaCertificationResults[2]);

    pixPlusMaitreCertificationResultRepositoryStub.withArgs({ certificationCourseId: certifCourse.getId() }).resolves(pixPlusDroitMaitreCertificationResults[0]);
    pixPlusMaitreCertificationResultRepositoryStub.withArgs({ certificationCourseId: certifCourse2.getId() }).resolves(pixPlusDroitMaitreCertificationResults[1]);
    pixPlusMaitreCertificationResultRepositoryStub.withArgs({ certificationCourseId: certifCourse3.getId() }).resolves(pixPlusDroitMaitreCertificationResults[2]);

    pixPlusExpertCertificationResultRepositoryStub.withArgs({ certificationCourseId: certifCourse.getId() }).resolves(pixPlusDroitExpertCertificationResults[0]);
    pixPlusExpertCertificationResultRepositoryStub.withArgs({ certificationCourseId: certifCourse2.getId() }).resolves(pixPlusDroitExpertCertificationResults[1]);
    pixPlusExpertCertificationResultRepositoryStub.withArgs({ certificationCourseId: certifCourse3.getId() }).resolves(pixPlusDroitExpertCertificationResults[2]);

    const firstCertifResult = _buildCertificationResult(certifCourse, assessmentResult, cleaCertificationResults[0], pixPlusDroitMaitreCertificationResults[0], pixPlusDroitExpertCertificationResults[0]);
    const secondCertifResult = _buildCertificationResult(certifCourse2, assessmentResult2, cleaCertificationResults[1], pixPlusDroitMaitreCertificationResults[1], pixPlusDroitExpertCertificationResults[1]);
    const thirdCertifResult = _buildCertificationResult(certifCourse3, assessmentResult3, cleaCertificationResults[2], pixPlusDroitMaitreCertificationResults[2], pixPlusDroitExpertCertificationResults[2]);

    assessmentRepositoryStub.withArgs(certifCourse.getId()).resolves(assessmentId);
    assessmentRepositoryStub.withArgs(certifCourse2.getId()).resolves(assessmentId2);
    assessmentRepositoryStub.withArgs(certifCourse3.getId()).resolves(assessmentId3);

    assessmentResultRepositoryStub.withArgs({ certificationCourseId: certifCourse.getId() }).resolves(assessmentResult);
    assessmentResultRepositoryStub.withArgs({ certificationCourseId: certifCourse2.getId() }).resolves(assessmentResult2);
    assessmentResultRepositoryStub.withArgs({ certificationCourseId: certifCourse3.getId() }).resolves(assessmentResult3);

    certificationCourseRepository.findCertificationCoursesBySessionId.withArgs({ sessionId: sessionWith2Candidates.id }).resolves([certifCourse, certifCourse2, certifCourse3]);

    // when
    const { certificationResults } = await getSessionResults({
      sessionId: sessionWith2Candidates.id,
      sessionRepository,
      certificationCourseRepository,
    });

    // then
    const expectedCertifResults = [ firstCertifResult, secondCertifResult, thirdCertifResult ];
    expect(certificationResults).to.deep.equal(expectedCertifResults);
  });

  it('should return the session', async function() {
    // given
    certificationCourseRepository.findCertificationCoursesBySessionId.withArgs({ sessionId: sessionWith2Candidates.id }).resolves([certifCourse]);

    // when
    const { session } = await getSessionResults({
      sessionId: sessionWith2Candidates.id,
      sessionRepository,
      certificationCourseRepository,
    });

    // then
    const expectedSession = sessionWith2Candidates;
    expect(session).to.deep.equal(expectedSession);
  });

  it('should return the fileName', async function() {
    // given
    certificationCourseRepository.findCertificationCoursesBySessionId.withArgs({ sessionId: sessionWith2Candidates.id }).resolves([certifCourse]);

    // when
    const { fileName } = await getSessionResults({
      sessionId: sessionWith2Candidates.id,
      sessionRepository,
      certificationCourseRepository,
    });

    // then
    const expectedFileName = `20200101_1200_resultats_session_${sessionWith2Candidates.id}.csv`;
    expect(fileName).to.deep.equal(expectedFileName);
  });

});

function _buildCertificationResult(certifCourse, lastAssessmentResult, cleaCertificationResult, pixPlusDroitMaitreCertificationResult, pixPlusDroitExpertCertificationResult) {
  return domainBuilder.buildCertificationResult({
    ...certifCourse.toDTO(),
    lastAssessmentResult,
    assessmentId: lastAssessmentResult.assessmentId,
    cleaCertificationResult,
    pixPlusDroitMaitreCertificationResult,
    pixPlusDroitExpertCertificationResult,
    competencesWithMark: [],
  });
}
