const { sinon, expect, catchErr, domainBuilder } = require('../../../test-helper');
const handleAutoJury = require('../../../../lib/domain/events/handle-auto-jury');
const SessionFinalized = require('../../../../lib/domain/events/SessionFinalized');
const AutoJuryDone = require('../../../../lib/domain/events/AutoJuryDone');
const CertificationJuryDone = require('../../../../lib/domain/events/CertificationJuryDone');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const { CertificationIssueReportSubcategories, CertificationIssueReportCategories } = require('../../../../lib/domain/models/CertificationIssueReportCategory');

describe('Unit | Domain | Events | handle-auto-jury', () => {

  it('fails when event is not of correct type', async () => {
    // given
    const event = 'not an event of the correct type';

    // when
    const error = await catchErr(handleAutoJury)(event);

    // / then
    expect(error).not.to.be.null;
  });

  it('auto neutralizes challenges', async () => {
    // given
    const certificationCourseRepository = { findCertificationCoursesBySessionId: sinon.stub() };
    const certificationIssueReportRepository = { findByCertificationCourseId: sinon.stub(), save: sinon.stub() };
    const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub(), save: sinon.stub() };
    const challengeRepository = { get: sinon.stub() };
    const challengeToBeNeutralized1 = domainBuilder.buildCertificationChallengeWithType({ challengeId: 'recChal123', isNeutralized: false });
    const challengeToBeNeutralized2 = domainBuilder.buildCertificationChallengeWithType({ challengeId: 'recChal456', isNeutralized: false });
    const challengeNotToBeNeutralized = domainBuilder.buildCertificationChallengeWithType({ challengeId: 'recChal789', isNeutralized: false });
    const certificationAssessment = domainBuilder.buildCertificationAssessment({
      certificationAnswersByDate: [
        domainBuilder.buildAnswer({ challengeId: 'recChal123', result: AnswerStatus.SKIPPED }),
        domainBuilder.buildAnswer({ challengeId: 'recChal456', result: AnswerStatus.KO }),
        domainBuilder.buildAnswer({ challengeId: 'recChal789', result: AnswerStatus.OK }),
      ],
      certificationChallenges: [
        challengeToBeNeutralized1,
        challengeToBeNeutralized2,
        challengeNotToBeNeutralized,
      ],
    });
    const certificationCourse = domainBuilder.buildCertificationCourse();
    const certificationIssueReport = domainBuilder.buildCertificationIssueReport({ category: CertificationIssueReportCategories.IN_CHALLENGE, subcategory: CertificationIssueReportSubcategories.WEBSITE_BLOCKED, questionNumber: 1 });
    const certificationIssueReport2 = domainBuilder.buildCertificationIssueReport({ category: CertificationIssueReportCategories.FRAUD, subcategory: undefined, questionNumber: 1 });

    certificationCourseRepository.findCertificationCoursesBySessionId.withArgs({ sessionId: 1234 }).resolves([ certificationCourse ]);
    certificationIssueReportRepository.findByCertificationCourseId.withArgs(certificationCourse.id).resolves([ certificationIssueReport, certificationIssueReport2 ]);
    certificationAssessmentRepository.getByCertificationCourseId.withArgs({ certificationCourseId: certificationCourse.id }).resolves(certificationAssessment);
    certificationAssessmentRepository.save.resolves();
    const event = new SessionFinalized({
      sessionId: 1234,
      finalizedAt: new Date(),
      hasExaminerGlobalComment: false,
      certificationCenterName: 'A certification center name',
      sessionDate: '2021-01-29',
      sessionTime: '14:00',
    });

    // when
    await handleAutoJury({
      event,
      certificationIssueReportRepository,
      certificationAssessmentRepository,
      certificationCourseRepository,
      challengeRepository,
    });

    // then
    expect(certificationIssueReport.isResolved()).to.be.true;
    expect(certificationAssessmentRepository.save).to.have.been.calledWith(certificationAssessment);
  });

  it('returns an AutoJuryDone event', async () => {
    // given
    const now = Date.now();
    const certificationCourseRepository = { findCertificationCoursesBySessionId: sinon.stub() };
    const certificationIssueReportRepository = { findByCertificationCourseId: sinon.stub() };
    const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub(), save: sinon.stub() };

    const certificationCourse = domainBuilder.buildCertificationCourse();
    certificationCourseRepository.findCertificationCoursesBySessionId.withArgs({ sessionId: 1234 }).resolves([ certificationCourse ]);
    certificationIssueReportRepository.findByCertificationCourseId.withArgs(certificationCourse.id).resolves([]);

    const event = new SessionFinalized({
      sessionId: 1234,
      finalizedAt: now,
      hasExaminerGlobalComment: false,
      certificationCenterName: 'A certification center name',
      sessionDate: '2021-01-29',
      sessionTime: '14:00',
    });

    // when
    const resultEvents = await handleAutoJury({
      event,
      certificationIssueReportRepository,
      certificationAssessmentRepository,
      certificationCourseRepository,
    });

    // then
    expect(resultEvents[0]).to.be.an.instanceof(AutoJuryDone);
    expect(resultEvents[0]).to.deep.equal(new AutoJuryDone({
      sessionId: 1234,
      finalizedAt: now,
      hasExaminerGlobalComment: false,
      certificationCenterName: 'A certification center name',
      sessionDate: '2021-01-29',
      sessionTime: '14:00',
    }));
  });

  it('returns a CertificationJuryDone event', async () => {
    // given
    const certificationCourseRepository = { findCertificationCoursesBySessionId: sinon.stub() };
    const certificationIssueReportRepository = { findByCertificationCourseId: sinon.stub(), save: sinon.stub() };
    const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub(), save: sinon.stub() };
    const challengeToBeNeutralized1 = domainBuilder.buildCertificationChallengeWithType({ challengeId: 'recChal123', isNeutralized: false });
    const certificationAssessment = domainBuilder.buildCertificationAssessment({
      certificationAnswersByDate: [
        domainBuilder.buildAnswer({ challengeId: 'recChal123', result: AnswerStatus.SKIPPED }),
      ],
      certificationChallenges: [
        challengeToBeNeutralized1,
      ],
    });
    const certificationCourse = domainBuilder.buildCertificationCourse();
    const certificationIssueReport1 = domainBuilder.buildCertificationIssueReport({ category: CertificationIssueReportCategories.IN_CHALLENGE, subcategory: CertificationIssueReportSubcategories.WEBSITE_BLOCKED, questionNumber: 1 });
    certificationCourseRepository.findCertificationCoursesBySessionId.withArgs({ sessionId: 1234 }).resolves([ certificationCourse ]);
    certificationIssueReportRepository.findByCertificationCourseId.withArgs(certificationCourse.id).resolves([ certificationIssueReport1 ]);
    certificationAssessmentRepository.getByCertificationCourseId.withArgs({ certificationCourseId: certificationCourse.id }).resolves(certificationAssessment);
    certificationAssessmentRepository.save.resolves();
    const event = new SessionFinalized({
      sessionId: 1234,
      finalizedAt: new Date(),
      hasExaminerGlobalComment: false,
      certificationCenterName: 'A certification center name',
      sessionDate: '2021-01-29',
      sessionTime: '14:00',
    });

    // when
    const events = await handleAutoJury({
      event,
      certificationIssueReportRepository,
      certificationAssessmentRepository,
      certificationCourseRepository,
    });

    // then
    expect(events[1]).to.be.an.instanceof(CertificationJuryDone);
    expect(events[1]).to.deep.equal(new CertificationJuryDone({
      certificationCourseId: certificationCourse.id,
    }));
  });

  context('when there is no certification issue report', () => {
    it('does not return a CertificationJuryDone event', async () => {
      // given
      const certificationCourseRepository = { findCertificationCoursesBySessionId: sinon.stub() };
      const certificationIssueReportRepository = { findByCertificationCourseId: sinon.stub() };
      const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub(), save: sinon.stub() };

      const certificationCourse = domainBuilder.buildCertificationCourse();
      certificationCourseRepository.findCertificationCoursesBySessionId.withArgs({ sessionId: 1234 }).resolves([ certificationCourse ]);
      certificationIssueReportRepository.findByCertificationCourseId.withArgs(certificationCourse.id).resolves([]);
      const event = new SessionFinalized({
        sessionId: 1234,
        finalizedAt: new Date(),
        hasExaminerGlobalComment: false,
        certificationCenterName: 'A certification center name',
        sessionDate: '2021-01-29',
        sessionTime: '14:00',
      });

      // when
      const events = await handleAutoJury({
        event,
        certificationIssueReportRepository,
        certificationAssessmentRepository,
        certificationCourseRepository,
      });

      // then
      expect(events.length).to.equal(1);
      expect(events[0]).not.to.be.an.instanceOf(CertificationJuryDone);
    });
  });

  context('when there is no impacted certification', () => {

    it('does not return a CertificationJuryDone event', async () => {
      // given
      const certificationCourseRepository = { findCertificationCoursesBySessionId: sinon.stub() };
      const certificationIssueReportRepository = { findByCertificationCourseId: sinon.stub() };
      const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub(), save: sinon.stub() };
      const challenge = domainBuilder.buildCertificationChallengeWithType({ challengeId: 'recChal123', isNeutralized: false });
      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        certificationAnswersByDate: [
          domainBuilder.buildAnswer({ challengeId: 'recChal123', result: AnswerStatus.OK }),
        ],
        certificationChallenges: [
          challenge,
        ],
      });
      const certificationCourse = domainBuilder.buildCertificationCourse();
      const certificationIssueReport1 = domainBuilder.buildCertificationIssueReport({ category: CertificationIssueReportCategories.FRAUD, subcategory: null, questionNumber: 1 });
      certificationCourseRepository.findCertificationCoursesBySessionId.withArgs({ sessionId: 1234 }).resolves([ certificationCourse ]);
      certificationIssueReportRepository.findByCertificationCourseId.withArgs(certificationCourse.id).resolves([ certificationIssueReport1 ]);
      certificationAssessmentRepository.getByCertificationCourseId.withArgs({ certificationCourseId: certificationCourse.id }).resolves(certificationAssessment);
      certificationAssessmentRepository.save.resolves();
      const event = new SessionFinalized({
        sessionId: 1234,
        finalizedAt: new Date(),
        hasExaminerGlobalComment: false,
        certificationCenterName: 'A certification center name',
        sessionDate: '2021-01-29',
        sessionTime: '14:00',
      });

      // when
      const events = await handleAutoJury({
        event,
        certificationIssueReportRepository,
        certificationAssessmentRepository,
        certificationCourseRepository,
      });

      // then
      expect(events.length).to.equal(1);
      expect(events[0]).not.to.be.an.instanceOf(CertificationJuryDone);
    });
  });

  context('when a resolution throws an exception', () => {
    it('should go on and try to resolve the others certification issue reports', async () => {
      // given
      const certificationCourseRepository = { findCertificationCoursesBySessionId: sinon.stub() };
      const certificationIssueReportRepository = { findByCertificationCourseId: sinon.stub(), save: sinon.stub() };
      const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub(), save: sinon.stub() };
      const challengeToBeNeutralized1 = domainBuilder.buildCertificationChallengeWithType({ challengeId: 'recChal123', isNeutralized: false });
      const challengeToBeNeutralized2 = domainBuilder.buildCertificationChallengeWithType({ challengeId: 'recChal456', isNeutralized: false });
      const challengeNotToBeNeutralized = domainBuilder.buildCertificationChallengeWithType({ challengeId: 'recChal789', isNeutralized: false });
      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        certificationAnswersByDate: [
          domainBuilder.buildAnswer({ challengeId: 'recChal123', result: AnswerStatus.SKIPPED }),
          domainBuilder.buildAnswer({ challengeId: 'recChal456', result: AnswerStatus.KO }),
          domainBuilder.buildAnswer({ challengeId: 'recChal789', result: AnswerStatus.OK }),
        ],
        certificationChallenges: [
          challengeToBeNeutralized1,
          challengeToBeNeutralized2,
          challengeNotToBeNeutralized,
        ],
      });
      const certificationCourse = domainBuilder.buildCertificationCourse();
      const certificationIssueReport = domainBuilder.buildCertificationIssueReport({ category: CertificationIssueReportCategories.IN_CHALLENGE, subcategory: CertificationIssueReportSubcategories.IMAGE_NOT_DISPLAYING, questionNumber: 1 });
      const certificationIssueReport2 = domainBuilder.buildCertificationIssueReport({ category: CertificationIssueReportCategories.IN_CHALLENGE, subcategory: CertificationIssueReportSubcategories.WEBSITE_BLOCKED, questionNumber: 1 });
      const challengeRepository = {
        get: sinon.stub(),
      };
      const anError = new Error('something bad happened');
      challengeRepository.get.rejects(anError);
      certificationCourseRepository.findCertificationCoursesBySessionId.withArgs({ sessionId: 1234 }).resolves([ certificationCourse ]);
      certificationIssueReportRepository.findByCertificationCourseId.withArgs(certificationCourse.id).resolves([ certificationIssueReport, certificationIssueReport2 ]);
      certificationAssessmentRepository.getByCertificationCourseId.withArgs({ certificationCourseId: certificationCourse.id }).resolves(certificationAssessment);
      certificationAssessmentRepository.save.resolves();
      const event = new SessionFinalized({
        sessionId: 1234,
        finalizedAt: new Date(),
        hasExaminerGlobalComment: false,
        certificationCenterName: 'A certification center name',
        sessionDate: '2021-01-29',
        sessionTime: '14:00',
      });
      const logger = {
        error: sinon.stub(),
      };

      // when
      await handleAutoJury({
        event,
        certificationIssueReportRepository,
        certificationAssessmentRepository,
        certificationCourseRepository,
        challengeRepository,
        logger,
      });

      // then
      expect(certificationIssueReport2.isResolved()).to.be.true;
      expect(logger.error).to.have.been.calledWith(anError);
    });
  });
});

