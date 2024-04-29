import _ from 'lodash';

import { NotFoundError } from '../../../../../../lib/domain/errors.js';
import { CertificationAssessment } from '../../../../../../lib/domain/models/CertificationAssessment.js';
import { DomainTransaction } from '../../../../../../lib/infrastructure/DomainTransaction.js';
import { Session } from '../../../../../../src/certification/session/domain/models/Session.js';
import * as sessionRepository from '../../../../../../src/certification/session/infrastructure/repositories/session-repository.js';
import { SESSION_STATUSES } from '../../../../../../src/certification/shared/domain/constants.js';
import { ComplementaryCertificationKeys } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { catchErr, databaseBuilder, domainBuilder, expect, knex } from '../../../../../test-helper.js';

describe('Integration | Repository | Certification | session | SessionManagement', function () {
  describe('#get', function () {
    let session;
    let expectedSessionValues;
    let sessionCreator;

    beforeEach(async function () {
      // given
      sessionCreator = databaseBuilder.factory.buildUser({});
      session = databaseBuilder.factory.buildSession({
        certificationCenter: 'Tour Gamma',
        address: 'rue de Bercy',
        room: 'Salle A',
        examiner: 'Monsieur Examinateur',
        date: '2018-02-23',
        time: '12:00:00',
        description: 'CertificationPix pour les jeunes',
        accessCode: 'NJR10',
        createdBy: sessionCreator.id,
      });
      expectedSessionValues = {
        id: session.id,
        certificationCenter: session.certificationCenter,
        address: session.address,
        room: session.room,
        examiner: session.examiner,
        date: session.date,
        time: session.time,
        description: session.description,
        accessCode: session.accessCode,
        createdBy: sessionCreator.id,
      };
      await databaseBuilder.commit();
    });

    it('should return session informations in a session Object', async function () {
      // when
      const actualSession = await sessionRepository.get({ id: session.id });

      // then
      expect(actualSession).to.be.instanceOf(SessionManagement);
      expect(actualSession, 'date').to.deep.includes(expectedSessionValues);
    });

    it('should return a Not found error when no session was found', async function () {
      // when
      const error = await catchErr(sessionRepository.get)({ id: 2 });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  describe('#isFinalized', function () {
    let finalizedSessionId;
    let notFinalizedSessionId;

    beforeEach(function () {
      finalizedSessionId = databaseBuilder.factory.buildSession({ finalizedAt: new Date() }).id;
      notFinalizedSessionId = databaseBuilder.factory.buildSession({ finalizedAt: null }).id;

      return databaseBuilder.commit();
    });

    it('should return true if the session status is finalized', async function () {
      // when
      const isFinalized = await sessionRepository.isFinalized({ id: finalizedSessionId });

      // then
      expect(isFinalized).to.be.equal(true);
    });

    it('should return false if the session status is not finalized', async function () {
      // when
      const isFinalized = await sessionRepository.isFinalized({ id: notFinalizedSessionId });

      // then
      expect(isFinalized).to.be.equal(false);
    });
  });

  describe('#isPublished', function () {
    context('when the session has a published date', function () {
      it('should return true', async function () {
        //given
        databaseBuilder.factory.buildSession({ id: 40, publishedAt: new Date() });
        await databaseBuilder.commit();

        // when
        const isPublished = await sessionRepository.isPublished({ id: 40 });

        // then
        expect(isPublished).to.be.equal(true);
      });
    });

    context('when the session has no published date', function () {
      it('should return tre', async function () {
        //given
        databaseBuilder.factory.buildSession({ id: 40, publishedAt: null });
        await databaseBuilder.commit();

        // when
        const isPublished = await sessionRepository.isPublished({ id: 40 });

        // then
        expect(isPublished).to.be.equal(false);
      });
    });
  });

  describe('#doesUserHaveCertificationCenterMembershipForSession', function () {
    it('should return true if user has membership in the certification center that originated the session', async function () {
      // given
      const userId = 1;
      const userIdNotAllowed = 2;
      databaseBuilder.factory.buildUser({ id: userId });
      databaseBuilder.factory.buildUser({ id: userIdNotAllowed });
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const certificationCenterNotAllowedId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId: userIdNotAllowed,
        certificationCenterId: certificationCenterNotAllowedId,
      });
      const sessionId = databaseBuilder.factory.buildSession({ certificationCenterId }).id;

      await databaseBuilder.commit();

      // when
      const hasMembership = await sessionRepository.doesUserHaveCertificationCenterMembershipForSession({
        userId,
        sessionId,
      });

      // then
      expect(hasMembership).to.be.true;
    });

    it('should return false if user has a disabled membership in the certification center that originated the session', async function () {
      //given
      const userId = 1;
      const now = new Date();
      databaseBuilder.factory.buildUser({ id: userId });
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId, disabledAt: now });
      const sessionId = databaseBuilder.factory.buildSession({ certificationCenterId }).id;

      await databaseBuilder.commit();

      // when
      const hasMembership = await sessionRepository.doesUserHaveCertificationCenterMembershipForSession({
        userId,
        sessionId,
      });

      // then
      expect(hasMembership).to.be.false;
    });

    it('should return false if user has no membership in the certification center that originated the session', async function () {
      //given
      const userId = 1;
      const userIdNotAllowed = 2;
      databaseBuilder.factory.buildUser({ id: userId });
      databaseBuilder.factory.buildUser({ id: userIdNotAllowed });
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const certificationCenterNotAllowedId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
      databaseBuilder.factory.buildCertificationCenterMembership({
        userId: userIdNotAllowed,
        certificationCenterId: certificationCenterNotAllowedId,
      });
      const sessionId = databaseBuilder.factory.buildSession({ certificationCenterId }).id;

      await databaseBuilder.commit();

      // when
      const hasMembership = await sessionRepository.doesUserHaveCertificationCenterMembershipForSession({
        userId: userIdNotAllowed,
        sessionId,
      });

      // then
      expect(hasMembership).to.be.false;
    });
  });

  describe('#finalize', function () {
    let id;
    const examinerGlobalComment = '';
    const hasIncident = false;
    const hasJoiningIssue = true;
    const finalizedAt = new Date('2017-09-01T12:14:33Z');

    beforeEach(function () {
      id = databaseBuilder.factory.buildSession({ finalizedAt: null }).id;

      return databaseBuilder.commit();
    });

    it('should return an updated Session domain object', async function () {
      // when
      const sessionSaved = await sessionRepository.finalize({
        id,
        examinerGlobalComment,
        hasIncident,
        hasJoiningIssue,
        finalizedAt,
      });

      // then
      expect(sessionSaved).to.be.an.instanceof(Session);
      expect(sessionSaved.id).to.deep.equal(id);
      expect(sessionSaved.examinerGlobalComment).to.deep.equal(examinerGlobalComment);
      expect(sessionSaved.hasIncident).to.deep.equal(hasIncident);
      expect(sessionSaved.hasJoiningIssue).to.deep.equal(hasJoiningIssue);
      expect(sessionSaved.status).to.deep.equal(SESSION_STATUSES.FINALIZED);
    });
  });

  describe('#unfinalize', function () {
    it('should update the session', async function () {
      // given
      const { id: userId } = databaseBuilder.factory.buildUser();
      const session = databaseBuilder.factory.buildSession({
        id: 99,
        finalizedAt: new Date(),
        assignedCertificationOfficerId: userId,
      });

      await databaseBuilder.commit();

      // when
      await sessionRepository.unfinalize({ id: 99 });

      // then
      const dbSession = await knex('sessions').select('*').where({ id: 99 }).first();
      expect(dbSession).to.deep.equal({ ...session, finalizedAt: null, assignedCertificationOfficerId: null });
    });

    context('when there is a transaction', function () {
      it('allows to rollback', async function () {
        // given
        const { id: userId } = databaseBuilder.factory.buildUser();
        const session = databaseBuilder.factory.buildSession({
          id: 99,
          finalizedAt: new Date(),
          assignedCertificationOfficerId: userId,
        });
        await databaseBuilder.commit();

        // when
        await DomainTransaction.execute(async (domainTransaction) => {
          await sessionRepository.unfinalize({ id: 99, domainTransaction });
          return domainTransaction.knexTransaction.rollback();
        });

        /// then
        const dbSession = await knex('sessions').select('*').where({ id: 99 }).first();
        expect(dbSession).to.deep.equal(session);
      });
    });

    context('when the session does not exists', function () {
      it('should throw a not found error', async function () {
        // given
        // when
        const error = await catchErr(sessionRepository.unfinalize)({ id: 99 });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });

  describe('#flagResultsAsSentToPrescriber', function () {
    let id;
    const resultsSentToPrescriberAt = new Date('2017-09-01T12:14:33Z');

    beforeEach(function () {
      id = databaseBuilder.factory.buildSession({ resultsSentToPrescriberAt: null }).id;

      return databaseBuilder.commit();
    });

    it('should return a flagged Session domain object', async function () {
      // when
      const sessionFlagged = await sessionRepository.flagResultsAsSentToPrescriber({ id, resultsSentToPrescriberAt });

      // then
      expect(sessionFlagged).to.be.an.instanceof(Session);
      expect(sessionFlagged.id).to.deep.equal(id);
      expect(sessionFlagged.resultsSentToPrescriberAt).to.deep.equal(resultsSentToPrescriberAt);
    });
  });

  describe('#updatePublishedAt', function () {
    let id;
    const publishedAt = new Date('2017-09-01T12:14:33Z');

    beforeEach(function () {
      id = databaseBuilder.factory.buildSession({ publishedAt: null }).id;

      return databaseBuilder.commit();
    });

    it('should return a updated Session domain object', async function () {
      // when
      const sessionFlagged = await sessionRepository.updatePublishedAt({ id, publishedAt });

      // then
      expect(sessionFlagged).to.be.an.instanceof(Session);
      expect(sessionFlagged.id).to.deep.equal(id);
      expect(sessionFlagged.publishedAt).to.deep.equal(publishedAt);
    });
  });

  describe('#hasSomeCleaAcquired', function () {
    context('when session is published', function () {
      context('when at least one candidate has acquired Cléa', function () {
        it('should return true', async function () {
          // given
          const sessionId = databaseBuilder.factory.buildSession({
            publishedAt: '2022-01-01',
          }).id;
          const userId = databaseBuilder.factory.buildUser().id;
          databaseBuilder.factory.buildCertificationCandidate({ sessionId, userId });
          const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
            sessionId,
            userId,
          }).id;
          const badgeId = databaseBuilder.factory.buildBadge().id;
          const complementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification.clea({}).id;
          const complementaryCertificationBadgeId = databaseBuilder.factory.buildComplementaryCertificationBadge({
            badgeId,
            complementaryCertificationId,
          }).id;
          const complementaryCertificationCourseId = databaseBuilder.factory.buildComplementaryCertificationCourse({
            complementaryCertificationId,
            complementaryCertificationBadgeId,
            certificationCourseId,
          }).id;
          databaseBuilder.factory.buildComplementaryCertificationCourseResult({
            complementaryCertificationCourseId,
            acquired: true,
          });

          await databaseBuilder.commit();

          // when
          const hasSomeCleaAcquired = await sessionRepository.hasSomeCleaAcquired({ id: sessionId });

          // then
          expect(hasSomeCleaAcquired).to.be.true;
        });
      });
    });

    context('when session is not published', function () {
      it('should return true', async function () {
        // given
        const sessionId = databaseBuilder.factory.buildSession({
          publishedAt: null,
        }).id;
        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildCertificationCandidate({ sessionId, userId });
        const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
          sessionId,
          userId,
        }).id;
        const badgeId = databaseBuilder.factory.buildBadge().id;
        const complementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification.clea({}).id;
        const complementaryCertificationBadgeId = databaseBuilder.factory.buildComplementaryCertificationBadge({
          badgeId,
          complementaryCertificationId,
        }).id;
        const complementaryCertificationCourseId = databaseBuilder.factory.buildComplementaryCertificationCourse({
          complementaryCertificationId,
          complementaryCertificationBadgeId,
          certificationCourseId,
        }).id;
        databaseBuilder.factory.buildComplementaryCertificationCourseResult({
          complementaryCertificationCourseId,
          acquired: true,
        });

        await databaseBuilder.commit();

        // when
        const hasSomeCleaAcquired = await sessionRepository.hasSomeCleaAcquired({ id: sessionId });

        // then
        expect(hasSomeCleaAcquired).to.be.false;
      });
    });

    context('when no candidate has acquired Cléa', function () {
      it('should return false', async function () {
        // given
        const sessionId = databaseBuilder.factory.buildSession().id;
        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildCertificationCandidate({ sessionId, userId });
        const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
          sessionId,
          userId,
        }).id;
        const badgeId = databaseBuilder.factory.buildBadge().id;
        const complementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification.clea({}).id;
        const complementaryCertificationBadgeId = databaseBuilder.factory.buildComplementaryCertificationBadge({
          badgeId,
          complementaryCertificationId,
        }).id;
        const complementaryCertificationCourseId = databaseBuilder.factory.buildComplementaryCertificationCourse({
          complementaryCertificationId,
          complementaryCertificationBadgeId,
          certificationCourseId,
        }).id;
        databaseBuilder.factory.buildComplementaryCertificationCourseResult({
          complementaryCertificationCourseId,
          acquired: false,
        });

        await databaseBuilder.commit();

        // when
        const hasSomeCleaAcquired = await sessionRepository.hasSomeCleaAcquired({ id: sessionId });

        // then
        expect(hasSomeCleaAcquired).to.be.false;
      });
    });

    context('when the session has no certification course', function () {
      it('should return false', async function () {
        // given
        const sessionId = databaseBuilder.factory.buildSession().id;
        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildCertificationCandidate({ sessionId, userId });

        await databaseBuilder.commit();

        // when
        const hasSomeCleaAcquired = await sessionRepository.hasSomeCleaAcquired({ id: sessionId });

        // then
        expect(hasSomeCleaAcquired).to.be.false;
      });
    });

    context('when the session has no candidate', function () {
      it('should return false', async function () {
        // given
        const sessionId = databaseBuilder.factory.buildSession().id;

        await databaseBuilder.commit();

        // when
        const hasSomeCleaAcquired = await sessionRepository.hasSomeCleaAcquired({ id: sessionId });

        // then
        expect(hasSomeCleaAcquired).to.be.false;
      });
    });
  });

  describe('#hasNoStartedCertification', function () {
    context('when session has at least one certification course', function () {
      it('should return false', async function () {
        // given
        const sessionId = databaseBuilder.factory.buildSession({}).id;
        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildCertificationCandidate({ sessionId, userId });
        databaseBuilder.factory.buildCertificationCourse({
          sessionId,
          userId,
        });

        await databaseBuilder.commit();

        // when
        const hasNoStartedCertification = await sessionRepository.hasNoStartedCertification({ id: sessionId });

        // then
        expect(hasNoStartedCertification).to.be.false;
      });
    });

    context('when session has no certification course', function () {
      it('should return true', async function () {
        // given
        const sessionId = databaseBuilder.factory.buildSession({}).id;

        await databaseBuilder.commit();

        // when
        const hasNoStartedCertification = await sessionRepository.hasNoStartedCertification({ id: sessionId });

        // then
        expect(hasNoStartedCertification).to.be.true;
      });
    });
  });

  describe('#countUncompletedCertificationsAssessment', function () {
    context('when session has at least one uncompleted certification course', function () {
      it('should return the count of uncompleted certification courses', async function () {
        // given
        const sessionId = databaseBuilder.factory.buildSession({}).id;
        const userId1 = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildCertificationCandidate({ sessionId, userId: userId1 });
        databaseBuilder.factory.buildCertificationCourse({
          id: 97,
          sessionId,
          userId: userId1,
        });
        databaseBuilder.factory.buildAssessment({
          certificationCourseId: 97,
          state: CertificationAssessment.states.STARTED,
        });

        const userId2 = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildCertificationCandidate({ sessionId, userId: userId2 });
        databaseBuilder.factory.buildCertificationCourse({
          id: 98,
          sessionId,
          userId: userId2,
        });
        databaseBuilder.factory.buildAssessment({
          certificationCourseId: 98,
          state: CertificationAssessment.states.ENDED_BY_SUPERVISOR,
        });

        const userId3 = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildCertificationCandidate({ sessionId, userId: userId3 });
        databaseBuilder.factory.buildCertificationCourse({
          id: 99,
          sessionId,
          userId: userId3,
        });
        databaseBuilder.factory.buildAssessment({
          certificationCourseId: 99,
          state: CertificationAssessment.states.ENDED_DUE_TO_FINALIZATION,
        });

        const userId4 = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildCertificationCandidate({ sessionId, userId: userId4 });
        databaseBuilder.factory.buildCertificationCourse({
          id: 100,
          sessionId,
          userId: userId4,
        });
        databaseBuilder.factory.buildAssessment({
          certificationCourseId: 100,
          state: CertificationAssessment.states.COMPLETED,
        });

        await databaseBuilder.commit();

        // when
        const unfinishedCertificationsCount = await sessionRepository.countUncompletedCertificationsAssessment({
          id: sessionId,
        });

        // then
        expect(unfinishedCertificationsCount).to.equal(3);
      });
    });

    context('when session has no uncompleted certification course', function () {
      it('should return 0', async function () {
        // given
        const sessionId = databaseBuilder.factory.buildSession({}).id;
        const userId1 = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildCertificationCandidate({ sessionId, userId: userId1 });
        databaseBuilder.factory.buildCertificationCourse({
          id: 97,
          sessionId,
          userId: userId1,
        });
        databaseBuilder.factory.buildAssessment({
          certificationCourseId: 97,
          state: CertificationAssessment.states.COMPLETED,
        });

        await databaseBuilder.commit();

        // when
        const unfinishedCertificationsCount = await sessionRepository.countUncompletedCertificationsAssessment({
          id: sessionId,
        });

        // then
        expect(unfinishedCertificationsCount).to.equal(0);
      });
    });
  });

  describe('#getWithCertificationCandidates', function () {
    it('should return session information in a session Object', async function () {
      // given

      const sessionCreator = databaseBuilder.factory.buildUser();
      const session = databaseBuilder.factory.buildSession({
        certificationCenter: 'Tour Gamma',
        address: 'rue de Bercy',
        room: 'Salle A',
        examiner: 'Monsieur Examinateur',
        date: '2018-02-23',
        time: '12:00:00',
        description: 'CertificationPix pour les jeunes',
        accessCode: 'NJR10',
        version: 2,
        createdBy: sessionCreator.id,
      });
      await databaseBuilder.commit();

      // when
      const actualSession = await sessionRepository.getWithCertificationCandidates({ id: session.id });

      // then
      const expectedSession = domainBuilder.buildSession(session);
      expect(actualSession).to.deepEqualInstance(expectedSession);
    });

    it('should return associated certification candidates ordered by lastname and firstname', async function () {
      // given
      const session = databaseBuilder.factory.buildSession();
      databaseBuilder.factory.buildCertificationCandidate({
        lastName: 'Jackson',
        firstName: 'Michael',
        sessionId: session.id,
      });
      databaseBuilder.factory.buildCertificationCandidate({
        lastName: 'Stardust',
        firstName: 'Ziggy',
        sessionId: session.id,
      });
      databaseBuilder.factory.buildCertificationCandidate({
        lastName: 'Jackson',
        firstName: 'Janet',
        sessionId: session.id,
      });
      _.times(5, () => databaseBuilder.factory.buildCertificationCandidate());
      await databaseBuilder.commit();

      // when
      const actualSession = await sessionRepository.getWithCertificationCandidates({ id: session.id });

      // then
      const actualCandidates = _.map(actualSession.certificationCandidates, (item) =>
        _.pick(item, ['sessionId', 'lastName', 'firstName']),
      );
      expect(actualCandidates).to.have.deep.ordered.members([
        { sessionId: session.id, lastName: 'Jackson', firstName: 'Janet' },
        { sessionId: session.id, lastName: 'Jackson', firstName: 'Michael' },
        { sessionId: session.id, lastName: 'Stardust', firstName: 'Ziggy' },
      ]);
    });

    it('should return an empty certification candidates array if there is no candidates', async function () {
      // given
      const session = databaseBuilder.factory.buildSession();
      await databaseBuilder.commit();

      // when
      const actualSession = await sessionRepository.getWithCertificationCandidates({ id: session.id });

      // then
      expect(actualSession.certificationCandidates).to.deep.equal([]);
    });

    it('should return candidates complementary certification', async function () {
      // given
      const session = databaseBuilder.factory.buildSession();

      const pixPlusFoot = databaseBuilder.factory.buildComplementaryCertification({
        label: 'Pix+ Foot',
        key: ComplementaryCertificationKeys.CLEA,
      });
      const pixPlusRugby = databaseBuilder.factory.buildComplementaryCertification({
        label: 'Pix+ Rugby',
        key: ComplementaryCertificationKeys.PIX_PLUS_DROIT,
      });

      const firstCandidate = databaseBuilder.factory.buildCertificationCandidate({
        lastName: 'Jackson',
        firstName: 'Michael',
        sessionId: session.id,
      });
      const secondCandidate = databaseBuilder.factory.buildCertificationCandidate({
        lastName: 'Stardust',
        firstName: 'Ziggy',
        sessionId: session.id,
      });

      databaseBuilder.factory.buildComplementaryCertificationSubscription({
        certificationCandidateId: firstCandidate.id,
        complementaryCertificationId: pixPlusRugby.id,
      });
      databaseBuilder.factory.buildComplementaryCertificationSubscription({
        certificationCandidateId: secondCandidate.id,
        complementaryCertificationId: pixPlusFoot.id,
      });

      await databaseBuilder.commit();

      // when
      const actualSession = await sessionRepository.getWithCertificationCandidates({ id: session.id });

      // then
      const [firstCandidateFromSession, secondCandidateFromSession] = actualSession.certificationCandidates;
      expect(firstCandidateFromSession.complementaryCertification).to.deep.equal(
        domainBuilder.certification.session.buildCertificationSessionComplementaryCertification(pixPlusRugby),
      );
      expect(secondCandidateFromSession.complementaryCertification).to.deep.equal(
        domainBuilder.certification.session.buildCertificationSessionComplementaryCertification(pixPlusFoot),
      );
    });

    it('should return an empty candidates complementary certifications if there is no complementary certification', async function () {
      // given
      const session = databaseBuilder.factory.buildSession();
      databaseBuilder.factory.buildCertificationCandidate({
        lastName: 'Jackson',
        firstName: 'Michael',
        sessionId: session.id,
      });
      databaseBuilder.factory.buildCertificationCandidate({
        lastName: 'Stardust',
        firstName: 'Ziggy',
        sessionId: session.id,
      });
      await databaseBuilder.commit();

      // when
      const actualSession = await sessionRepository.getWithCertificationCandidates({ id: session.id });

      // then
      const [firstCandidateFromSession, secondCandidateFromSession] = actualSession.certificationCandidates;
      expect(firstCandidateFromSession.complementaryCertification).to.equal(null);
      expect(secondCandidateFromSession.complementaryCertification).to.equal(null);
    });

    it('should return a Not found error when no session was found', async function () {
      // given
      const session = databaseBuilder.factory.buildSession();
      await databaseBuilder.commit();

      // when
      const error = await catchErr(sessionRepository.getWithCertificationCandidates)({ id: session.id + 1 });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });
});
