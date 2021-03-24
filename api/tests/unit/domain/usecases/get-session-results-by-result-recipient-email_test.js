const { expect, sinon, domainBuilder } = require('../../../test-helper');

const getSessionResultsByResultRecipientEmail = require('../../../../lib/domain/usecases/get-session-results-by-result-recipient-email');

describe('Unit | Domain | Use Cases | get-session-results-by-result-recipient-email', function() {

  it('Returns only the certification results of the candidates with a given result recipient email', async function() {
    // given
    const { session, candidates } = buildSessionWithCandidates({
      sessionInfo: {
        id: 12345,
        date: '2020/01/01',
        time: '12:00',
      },
      candidatesInfo: [
        { userId: 1, resultRecipientEmail: 'non-matching@example.net' },
        { userId: 2, resultRecipientEmail: 'matching@example.net' },
      ],
    });
    const matchingCandidateCertificationCourse = buildCertificationCourseFromCandidate({
      candidate: candidates[1],
      session,
    });
    const matchingCandidateCertificationResult = buildCertificationResult(matchingCandidateCertificationCourse);

    const sessionRepository = {
      getWithCertificationCandidates: sinon.stub(),
    };
    sessionRepository.getWithCertificationCandidates.withArgs(12345).resolves(session);

    const certificationCourseRepository = {
      findBySessionIdAndUserIds: sinon.stub(),
    };
    certificationCourseRepository.findBySessionIdAndUserIds.withArgs({ sessionId: 12345, userIds: [2] }).resolves(
      [matchingCandidateCertificationCourse],
    );

    const certificationService = {
      getCertificationResultByCertifCourse: sinon.stub(),
    };
    certificationService.getCertificationResultByCertifCourse.withArgs({ certificationCourse: matchingCandidateCertificationCourse }).resolves(matchingCandidateCertificationResult);

    // when
    const certificationResults = await getSessionResultsByResultRecipientEmail({
      sessionId: 12345,
      sessionRepository,
      certificationCourseRepository,
      certificationService,
      resultRecipientEmail: 'matching@example.net',
    });

    // then
    expect(certificationResults).to.deep.equal(
      {
        session,
        certificationResults: [
          matchingCandidateCertificationResult,
        ],
        fileName: `20200101_1200_resultats_session_${12345}.csv`,
      });
  });

});

function buildSessionWithCandidates({ sessionInfo, candidatesInfo }) {
  const candidates = candidatesInfo.map((info) => {
    return domainBuilder.buildCertificationCandidate({
      userId: info.userId,
      sessionId: sessionInfo.id,
      resultRecipientEmail: info.resultRecipientEmail,
    });
  });
  const session = domainBuilder.buildSession(
    {
      date: sessionInfo.date,
      time: sessionInfo.time,
      id: sessionInfo.id,
      certificationCandidates: candidates,
    },
  );
  return { session, candidates };
}

function buildCertificationCourseFromCandidate({ candidate, session }) {
  return domainBuilder.buildCertificationCourse({
    userId: candidate.userId,
    sessionId: session.id,
  });
}

function buildCertificationResult(certificationCourse) {
  return domainBuilder.buildCertificationResult({
    id: certificationCourse.id,
    sessionId: certificationCourse.sessionId,
  });
}
