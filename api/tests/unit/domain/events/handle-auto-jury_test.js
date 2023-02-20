import { sinon, expect, catchErr, domainBuilder } from '../../../test-helper';
import handleAutoJury from '../../../../lib/domain/events/handle-auto-jury';
import SessionFinalized from '../../../../lib/domain/events/SessionFinalized';
import AutoJuryDone from '../../../../lib/domain/events/AutoJuryDone';
import CertificationJuryDone from '../../../../lib/domain/events/CertificationJuryDone';
import AnswerStatus from '../../../../lib/domain/models/AnswerStatus';
import {
  CertificationIssueReportSubcategories,
  CertificationIssueReportCategories,
} from '../../../../lib/domain/models/CertificationIssueReportCategory';

describe('Unit | Domain | Events | handle-auto-jury', function () {
  it('fails when event is not of correct type', async function () {
    // given
    const event = 'not an event of the correct type';

    // when
    const error = await catchErr(handleAutoJury)(event);

    // / then
    expect(error).not.to.be.null;
  });

  it('auto neutralizes challenges', async function () {
    // given
    const certificationCourseRepository = { findCertificationCoursesBySessionId: sinon.stub() };
    const certificationIssueReportRepository = { findByCertificationCourseId: sinon.stub(), save: sinon.stub() };
    const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub(), save: sinon.stub() };
    const challengeRepository = { get: sinon.stub() };
    const challengeToBeNeutralized1 = domainBuilder.buildCertificationChallengeWithType({
      challengeId: 'recChal123',
      isNeutralized: false,
    });
    const challengeToBeNeutralized2 = domainBuilder.buildCertificationChallengeWithType({
      challengeId: 'recChal456',
      isNeutralized: false,
    });
    const challengeNotToBeNeutralized = domainBuilder.buildCertificationChallengeWithType({
      challengeId: 'recChal789',
      isNeutralized: false,
    });
    const certificationAssessment = domainBuilder.buildCertificationAssessment({
      certificationAnswersByDate: [
        domainBuilder.buildAnswer({ challengeId: 'recChal123', result: AnswerStatus.SKIPPED }),
        domainBuilder.buildAnswer({ challengeId: 'recChal456', result: AnswerStatus.KO }),
        domainBuilder.buildAnswer({ challengeId: 'recChal789', result: AnswerStatus.OK }),
      ],
      certificationChallenges: [challengeToBeNeutralized1, challengeToBeNeutralized2, challengeNotToBeNeutralized],
    });
    const certificationCourse = domainBuilder.buildCertificationCourse();
    const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
      category: CertificationIssueReportCategories.IN_CHALLENGE,
      subcategory: CertificationIssueReportSubcategories.WEBSITE_BLOCKED,
      questionNumber: 1,
    });
    const certificationIssueReport2 = domainBuilder.buildCertificationIssueReport({
      category: CertificationIssueReportCategories.FRAUD,
      subcategory: undefined,
      questionNumber: 1,
    });

    certificationCourseRepository.findCertificationCoursesBySessionId
      .withArgs({ sessionId: 1234 })
      .resolves([certificationCourse]);
    certificationIssueReportRepository.findByCertificationCourseId
      .withArgs(certificationCourse.getId())
      .resolves([certificationIssueReport, certificationIssueReport2]);
    certificationAssessmentRepository.getByCertificationCourseId
      .withArgs({ certificationCourseId: certificationCourse.getId() })
      .resolves(certificationAssessment);
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
    expect(certificationIssueReport.hasBeenAutomaticallyResolved).to.be.true;
    expect(certificationAssessmentRepository.save).to.have.been.calledWith(certificationAssessment);
  });

  it('returns an AutoJuryDone event as last event', async function () {
    // given
    const now = Date.now();
    const certificationCourseRepository = { findCertificationCoursesBySessionId: sinon.stub() };
    const certificationIssueReportRepository = { findByCertificationCourseId: sinon.stub() };
    const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub(), save: sinon.stub() };
    const certificationAssessment = domainBuilder.buildCertificationAssessment({
      certificationAnswersByDate: [
        domainBuilder.buildAnswer({ challengeId: 'recChal123', result: AnswerStatus.SKIPPED }),
        domainBuilder.buildAnswer({ challengeId: 'recChal456', result: AnswerStatus.KO }),
        domainBuilder.buildAnswer({ challengeId: 'recChal789', result: AnswerStatus.OK }),
      ],
      certificationChallenges: [
        domainBuilder.buildCertificationChallengeWithType({ challengeId: 'recChal123' }),
        domainBuilder.buildCertificationChallengeWithType({ challengeId: 'recChal456' }),
        domainBuilder.buildCertificationChallengeWithType({ challengeId: 'recChal789' }),
      ],
    });

    const certificationCourse = domainBuilder.buildCertificationCourse();
    certificationAssessmentRepository.getByCertificationCourseId
      .withArgs({ certificationCourseId: certificationCourse.getId() })
      .resolves(certificationAssessment);
    certificationCourseRepository.findCertificationCoursesBySessionId
      .withArgs({ sessionId: 1234 })
      .resolves([certificationCourse]);
    certificationIssueReportRepository.findByCertificationCourseId.withArgs(certificationCourse.getId()).resolves([]);

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
    const autoJuryDoneEvent = resultEvents[resultEvents.length - 1];
    expect(autoJuryDoneEvent).to.be.an.instanceof(AutoJuryDone);
    expect(autoJuryDoneEvent).to.deep.equal(
      new AutoJuryDone({
        sessionId: 1234,
        finalizedAt: now,
        hasExaminerGlobalComment: false,
        certificationCenterName: 'A certification center name',
        sessionDate: '2021-01-29',
        sessionTime: '14:00',
      })
    );
  });

  it('returns a CertificationJuryDone event first in returned collection', async function () {
    // given
    const certificationCourseRepository = { findCertificationCoursesBySessionId: sinon.stub() };
    const certificationIssueReportRepository = { findByCertificationCourseId: sinon.stub(), save: sinon.stub() };
    const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub(), save: sinon.stub() };
    const challengeToBeNeutralized1 = domainBuilder.buildCertificationChallengeWithType({
      challengeId: 'recChal123',
      isNeutralized: false,
    });
    const certificationAssessment = domainBuilder.buildCertificationAssessment({
      certificationAnswersByDate: [
        domainBuilder.buildAnswer({ challengeId: 'recChal123', result: AnswerStatus.SKIPPED }),
      ],
      certificationChallenges: [challengeToBeNeutralized1],
    });
    const certificationCourse = domainBuilder.buildCertificationCourse();
    const certificationIssueReport1 = domainBuilder.buildCertificationIssueReport({
      category: CertificationIssueReportCategories.IN_CHALLENGE,
      subcategory: CertificationIssueReportSubcategories.WEBSITE_BLOCKED,
      questionNumber: 1,
    });
    certificationCourseRepository.findCertificationCoursesBySessionId
      .withArgs({ sessionId: 1234 })
      .resolves([certificationCourse]);
    certificationIssueReportRepository.findByCertificationCourseId
      .withArgs(certificationCourse.getId())
      .resolves([certificationIssueReport1]);
    certificationAssessmentRepository.getByCertificationCourseId
      .withArgs({ certificationCourseId: certificationCourse.getId() })
      .resolves(certificationAssessment);
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
    expect(events[0]).to.be.an.instanceof(CertificationJuryDone);
    expect(events[0]).to.deep.equal(
      new CertificationJuryDone({
        certificationCourseId: certificationCourse.getId(),
      })
    );
  });

  context('when the certification is not completed', function () {
    it('returns a CertificationJuryDone event first in returned collection', async function () {
      // given
      const certificationCourseRepository = { findCertificationCoursesBySessionId: sinon.stub() };
      const certificationIssueReportRepository = { findByCertificationCourseId: sinon.stub(), save: sinon.stub() };
      const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub(), save: sinon.stub() };
      const certificationAssessment = domainBuilder.buildCertificationAssessment({ certificationCourseId: 4567 });
      const certificationCourse = domainBuilder.buildCertificationCourse({
        sessionId: 1234,
        id: 4567,
        completedAt: null,
        abortReason: 'candidate',
      });
      certificationCourseRepository.findCertificationCoursesBySessionId
        .withArgs({ sessionId: 1234 })
        .resolves([certificationCourse]);
      certificationIssueReportRepository.findByCertificationCourseId.withArgs(certificationCourse.getId()).resolves([]);
      certificationAssessmentRepository.getByCertificationCourseId
        .withArgs({ certificationCourseId: certificationCourse.getId() })
        .resolves(certificationAssessment);
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
      expect(events[0]).to.deepEqualInstance(
        new CertificationJuryDone({
          certificationCourseId: certificationCourse.getId(),
        })
      );
    });

    context('when abort reason is candidate', function () {
      it('should skip unpassed challenges', async function () {
        // given
        const certificationCourseRepository = { findCertificationCoursesBySessionId: sinon.stub() };
        const certificationIssueReportRepository = { findByCertificationCourseId: sinon.stub(), save: sinon.stub() };
        const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub(), save: sinon.stub() };
        const challengeToBeConsideredAsSkipped = domainBuilder.buildCertificationChallengeWithType({
          challengeId: 'recChal123',
          isNeutralized: false,
          hasBeenSkippedAutomatically: false,
        });
        const challengeNotToBeConsideredAsSkipped = domainBuilder.buildCertificationChallengeWithType({
          challengeId: 'recChal456',
          isNeutralized: false,
          hasBeenSkippedAutomatically: false,
        });
        const answeredChallenge = domainBuilder.buildAnswer({
          challengeId: challengeNotToBeConsideredAsSkipped.challengeId,
        });
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationAnswersByDate: [answeredChallenge],
          certificationChallenges: [challengeToBeConsideredAsSkipped, challengeNotToBeConsideredAsSkipped],
        });
        const certificationCourse = domainBuilder.buildCertificationCourse({
          completedAt: null,
          abortReason: 'candidate',
        });
        certificationCourseRepository.findCertificationCoursesBySessionId
          .withArgs({ sessionId: 1234 })
          .resolves([certificationCourse]);
        certificationIssueReportRepository.findByCertificationCourseId
          .withArgs(certificationCourse.getId())
          .resolves([]);
        certificationAssessmentRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId: certificationCourse.getId() })
          .resolves(certificationAssessment);
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
        });

        // then
        expect(
          certificationAssessment.certificationChallenges.find(
            (certificationChallenge) => certificationChallenge.challengeId === 'recChal123'
          ).hasBeenSkippedAutomatically
        ).to.be.true;
        expect(
          certificationAssessment.certificationChallenges.find(
            (certificationChallenge) => certificationChallenge.challengeId === 'recChal456'
          ).hasBeenSkippedAutomatically
        ).to.be.false;
      });
    });

    context('when abort reason is technical', function () {
      it('should neutralize unpassed challenges', async function () {
        // given
        const certificationCourseRepository = { findCertificationCoursesBySessionId: sinon.stub() };
        const certificationIssueReportRepository = { findByCertificationCourseId: sinon.stub(), save: sinon.stub() };
        const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub(), save: sinon.stub() };
        const challengeToBeConsideredAsSkipped = domainBuilder.buildCertificationChallengeWithType({
          challengeId: 'recChal123',
          isNeutralized: false,
          hasBeenSkippedAutomatically: false,
        });
        const challengeNotToBeConsideredAsSkipped = domainBuilder.buildCertificationChallengeWithType({
          challengeId: 'recChal456',
          isNeutralized: false,
          hasBeenSkippedAutomatically: false,
        });
        const answeredChallenge = domainBuilder.buildAnswer({
          challengeId: challengeNotToBeConsideredAsSkipped.challengeId,
        });
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationAnswersByDate: [answeredChallenge],
          certificationChallenges: [challengeToBeConsideredAsSkipped, challengeNotToBeConsideredAsSkipped],
        });
        const certificationCourse = domainBuilder.buildCertificationCourse({
          completedAt: null,
          abortReason: 'technical',
        });
        certificationCourseRepository.findCertificationCoursesBySessionId
          .withArgs({ sessionId: 1234 })
          .resolves([certificationCourse]);
        certificationIssueReportRepository.findByCertificationCourseId
          .withArgs(certificationCourse.getId())
          .resolves([]);
        certificationAssessmentRepository.getByCertificationCourseId
          .withArgs({ certificationCourseId: certificationCourse.getId() })
          .resolves(certificationAssessment);
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
        });

        // then
        expect(certificationAssessment.certificationChallenges[0].isNeutralized).to.be.true;
        expect(certificationAssessment.certificationChallenges[0].challengeId).to.equal('recChal123');
        expect(certificationAssessment.certificationChallenges[1].isNeutralized).to.be.false;
      });
    });

    it('should save certification assessment', async function () {
      // given
      const certificationCourseRepository = { findCertificationCoursesBySessionId: sinon.stub() };
      const certificationIssueReportRepository = { findByCertificationCourseId: sinon.stub(), save: sinon.stub() };
      const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub(), save: sinon.stub() };
      const challengeToBeConsideredAsSkipped = domainBuilder.buildCertificationChallengeWithType({
        id: 123,
        associatedSkillName: 'cueillir des fleurs',
        challengeId: 'recChal123',
        type: 'QCU',
        competenceId: 'recCOMP',
        isNeutralized: false,
        hasBeenSkippedAutomatically: true,
        certifiableBadgeKey: null,
      });
      const challengeNotToBeConsideredAsSkipped = domainBuilder.buildCertificationChallengeWithType({
        id: 123,
        associatedSkillName: 'cueillir des fleurs',
        challengeId: 'recChal456',
        type: 'QCU',
        competenceId: 'recCOMP',
        isNeutralized: false,
        hasBeenSkippedAutomatically: false,
        certifiableBadgeKey: null,
      });
      const answeredChallenge = domainBuilder.buildAnswer({
        challengeId: challengeNotToBeConsideredAsSkipped.challengeId,
      });
      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        certificationAnswersByDate: [answeredChallenge],
        certificationChallenges: [challengeToBeConsideredAsSkipped, challengeNotToBeConsideredAsSkipped],
      });
      const certificationCourse = domainBuilder.buildCertificationCourse({
        completedAt: null,
        abortReason: 'candidate',
      });
      certificationCourseRepository.findCertificationCoursesBySessionId
        .withArgs({ sessionId: 1234 })
        .resolves([certificationCourse]);
      certificationIssueReportRepository.findByCertificationCourseId.withArgs(certificationCourse.getId()).resolves([]);
      certificationAssessmentRepository.getByCertificationCourseId
        .withArgs({ certificationCourseId: certificationCourse.getId() })
        .resolves(certificationAssessment);
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
      });

      // then
      const expectedCertificationAssessment = domainBuilder.buildCertificationAssessment({
        id: 123,
        userId: 123,
        certificationCourseId: 123,
        createdAt: new Date('2020-01-01T00:00:00Z'),
        completedAt: new Date('2020-01-01T00:00:00Z'),
        state: 'endedDueToFinalization',
        isV2Certification: true,
        certificationChallenges: [
          domainBuilder.buildCertificationChallengeWithType({
            ...challengeToBeConsideredAsSkipped,
            hasBeenSkippedAutomatically: true,
          }),
          challengeNotToBeConsideredAsSkipped,
        ],
        certificationAnswersByDate: [
          domainBuilder.buildAnswer({
            id: 123,
            result: 'ok',
            resultDetails: null,
            timeout: null,
            focusedOut: false,
            value: '1',
            levelup: undefined,
            assessmentId: 456,
            challengeId: 'recChal456',
            timeSpent: 20,
          }),
        ],
      });
      expect(certificationAssessmentRepository.save).to.have.been.calledWithExactly(expectedCertificationAssessment);
    });
  });
  context('when certificationCourse is completed', function () {
    it('should not return a CertificationJuryDone', async function () {
      // given
      const certificationCourseRepository = { findCertificationCoursesBySessionId: sinon.stub() };
      const certificationIssueReportRepository = { findByCertificationCourseId: sinon.stub(), save: sinon.stub() };
      const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub(), save: sinon.stub() };
      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        certificationCourseId: 4567,
      });
      const certificationCourse = domainBuilder.buildCertificationCourse({
        id: 4567,
        sessionId: 1234,
        completedAt: '2010-01-01',
        abortReason: null,
      });
      certificationCourseRepository.findCertificationCoursesBySessionId
        .withArgs({ sessionId: 1234 })
        .resolves([certificationCourse]);
      certificationIssueReportRepository.findByCertificationCourseId.withArgs(certificationCourse.getId()).resolves([]);
      certificationAssessmentRepository.getByCertificationCourseId
        .withArgs({ certificationCourseId: certificationCourse.getId() })
        .resolves(certificationAssessment);
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
      expect(events[0]).not.to.be.an.instanceof(CertificationJuryDone);
      expect(events.length).to.equal(1);
    });
  });

  context('when there is no certification issue report', function () {
    it('does not return a CertificationJuryDone event', async function () {
      // given
      const certificationCourseRepository = { findCertificationCoursesBySessionId: sinon.stub() };
      const certificationIssueReportRepository = { findByCertificationCourseId: sinon.stub() };
      const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub(), save: sinon.stub() };
      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        certificationCourseId: 4567,
        certificationAnswersByDate: [
          domainBuilder.buildAnswer({ challengeId: 'recChal123', result: AnswerStatus.SKIPPED }),
          domainBuilder.buildAnswer({ challengeId: 'recChal456', result: AnswerStatus.KO }),
          domainBuilder.buildAnswer({ challengeId: 'recChal789', result: AnswerStatus.OK }),
        ],
        certificationChallenges: [
          domainBuilder.buildCertificationChallengeWithType({ challengeId: 'recChal123' }),
          domainBuilder.buildCertificationChallengeWithType({ challengeId: 'recChal456' }),
          domainBuilder.buildCertificationChallengeWithType({ challengeId: 'recChal789' }),
        ],
      });

      const certificationCourse = domainBuilder.buildCertificationCourse({ id: 4567, sessionId: 1234 });
      certificationAssessmentRepository.getByCertificationCourseId
        .withArgs({ certificationCourseId: certificationCourse.getId() })
        .resolves(certificationAssessment);
      certificationCourseRepository.findCertificationCoursesBySessionId
        .withArgs({ sessionId: 1234 })
        .resolves([certificationCourse]);
      certificationIssueReportRepository.findByCertificationCourseId.withArgs(certificationCourse.getId()).resolves([]);
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

  context('when there is no impacted certification', function () {
    it('does not return a CertificationJuryDone event', async function () {
      // given
      const certificationCourseRepository = { findCertificationCoursesBySessionId: sinon.stub() };
      const certificationIssueReportRepository = { findByCertificationCourseId: sinon.stub() };
      const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub(), save: sinon.stub() };
      const challenge = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'recChal123',
        isNeutralized: false,
      });
      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        certificationCourseId: 4567,
        certificationAnswersByDate: [domainBuilder.buildAnswer({ challengeId: 'recChal123', result: AnswerStatus.OK })],
        certificationChallenges: [challenge],
      });
      const certificationCourse = domainBuilder.buildCertificationCourse({ id: 4567, sessionId: 1234 });
      const certificationIssueReport1 = domainBuilder.buildCertificationIssueReport({
        category: CertificationIssueReportCategories.FRAUD,
        subcategory: null,
        questionNumber: 1,
      });
      certificationCourseRepository.findCertificationCoursesBySessionId
        .withArgs({ sessionId: 1234 })
        .resolves([certificationCourse]);
      certificationIssueReportRepository.findByCertificationCourseId
        .withArgs(certificationCourse.getId())
        .resolves([certificationIssueReport1]);
      certificationAssessmentRepository.getByCertificationCourseId
        .withArgs({ certificationCourseId: certificationCourse.getId() })
        .resolves(certificationAssessment);
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

  context('when a resolution throws an exception', function () {
    it('should go on and try to resolve the others certification issue reports', async function () {
      // given
      const certificationCourseRepository = { findCertificationCoursesBySessionId: sinon.stub() };
      const certificationIssueReportRepository = { findByCertificationCourseId: sinon.stub(), save: sinon.stub() };
      const certificationAssessmentRepository = { getByCertificationCourseId: sinon.stub(), save: sinon.stub() };
      const challengeToBeNeutralized1 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'recChal123',
        isNeutralized: false,
      });
      const challengeToBeNeutralized2 = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'recChal456',
        isNeutralized: false,
      });
      const challengeNotToBeNeutralized = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'recChal789',
        isNeutralized: false,
      });
      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        certificationCourseId: 4567,
        certificationAnswersByDate: [
          domainBuilder.buildAnswer({ challengeId: 'recChal123', result: AnswerStatus.SKIPPED }),
          domainBuilder.buildAnswer({ challengeId: 'recChal456', result: AnswerStatus.KO }),
          domainBuilder.buildAnswer({ challengeId: 'recChal789', result: AnswerStatus.OK }),
        ],
        certificationChallenges: [challengeToBeNeutralized1, challengeToBeNeutralized2, challengeNotToBeNeutralized],
      });
      const certificationCourse = domainBuilder.buildCertificationCourse({ id: 4567, sessionId: 1234 });
      const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
        category: CertificationIssueReportCategories.IN_CHALLENGE,
        subcategory: CertificationIssueReportSubcategories.IMAGE_NOT_DISPLAYING,
        questionNumber: 1,
      });
      const certificationIssueReport2 = domainBuilder.buildCertificationIssueReport({
        category: CertificationIssueReportCategories.IN_CHALLENGE,
        subcategory: CertificationIssueReportSubcategories.WEBSITE_BLOCKED,
        questionNumber: 1,
      });
      const challengeRepository = {
        get: sinon.stub(),
      };
      const anError = new Error('something bad happened');
      challengeRepository.get.rejects(anError);
      certificationCourseRepository.findCertificationCoursesBySessionId
        .withArgs({ sessionId: 1234 })
        .resolves([certificationCourse]);
      certificationIssueReportRepository.findByCertificationCourseId
        .withArgs(certificationCourse.getId())
        .resolves([certificationIssueReport, certificationIssueReport2]);
      certificationAssessmentRepository.getByCertificationCourseId
        .withArgs({ certificationCourseId: certificationCourse.getId() })
        .resolves(certificationAssessment);
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
