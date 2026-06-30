import { SessionManagement } from '../../../../../../src/certification/session-management/domain/models/SessionManagement.js';
import * as sessionManagementRepository from '../../../../../../src/certification/session-management/infrastructure/repositories/session-management-repository.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | SessionManagement | Integration | Infrastructure | Repository | session-management', function () {
  describe('#get', function () {
    let session;
    let expectedSessionValues;
    let sessionCreator;
    let userForCandidate;
    let certificationCandidate;

    beforeEach(async function () {
      // given
      sessionCreator = databaseBuilder.factory.buildUser({});
      userForCandidate = databaseBuilder.factory.buildUser({});
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
      certificationCandidate = databaseBuilder.factory.buildCertificationCandidate({
        sessionId: session.id,
        userId: userForCandidate.id,
        reconciledAt: new Date(),
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
        certificationCandidates: [
          {
            id: certificationCandidate.id,
            userId: certificationCandidate.userId,
            reconciledAt: certificationCandidate.reconciledAt,
            resultRecipientEmail: certificationCandidate.resultRecipientEmail,
          },
        ],
      };
      await databaseBuilder.commit();
    });

    it('should return session informations in a session Object', async function () {
      // when
      const actualSession = await sessionManagementRepository.get({ id: session.id });

      // then
      expect(actualSession).to.be.instanceOf(SessionManagement);
      expect(actualSession).to.deep.includes(expectedSessionValues);
    });

    it('should return a Not found error when no session was found', async function () {
      // when
      const error = await catchErr(sessionManagementRepository.get)({ id: 2 });

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
      const isFinalized = await sessionManagementRepository.isFinalized({ id: finalizedSessionId });

      // then
      expect(isFinalized).to.be.equal(true);
    });

    it('should return false if the session status is not finalized', async function () {
      // when
      const isFinalized = await sessionManagementRepository.isFinalized({ id: notFinalizedSessionId });

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
        const isPublished = await sessionManagementRepository.isPublished({ id: 40 });

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
        const isPublished = await sessionManagementRepository.isPublished({ id: 40 });

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
      const hasMembership = await sessionManagementRepository.doesUserHaveCertificationCenterMembershipForSession({
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
      const hasMembership = await sessionManagementRepository.doesUserHaveCertificationCenterMembershipForSession({
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
      const hasMembership = await sessionManagementRepository.doesUserHaveCertificationCenterMembershipForSession({
        userId: userIdNotAllowed,
        sessionId,
      });

      // then
      expect(hasMembership).to.be.false;
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
      await sessionManagementRepository.unfinalize({ id: 99 });

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
          await sessionManagementRepository.unfinalize({ id: 99 });
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
        const error = await catchErr(sessionManagementRepository.unfinalize)({ id: 99 });

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

    it('should return a flagged SessionManagement domain object', async function () {
      // when
      const sessionFlagged = await sessionManagementRepository.flagResultsAsSentToPrescriber({
        id,
        resultsSentToPrescriberAt,
      });

      // then
      expect(sessionFlagged).to.be.an.instanceof(SessionManagement);
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

    it('should return a updated SessionManagement domain object', async function () {
      // when
      const sessionFlagged = await sessionManagementRepository.updatePublishedAt({ id, publishedAt });

      // then
      expect(sessionFlagged).to.be.an.instanceof(SessionManagement);
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
          const candidate = databaseBuilder.factory.buildCertificationCandidate({ sessionId, userId });
          databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidate.id });
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
          const hasSomeCleaAcquired = await sessionManagementRepository.hasSomeCleaAcquired({ id: sessionId });

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
        const candidate = databaseBuilder.factory.buildCertificationCandidate({ sessionId, userId });
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidate.id });
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
        const hasSomeCleaAcquired = await sessionManagementRepository.hasSomeCleaAcquired({ id: sessionId });

        // then
        expect(hasSomeCleaAcquired).to.be.false;
      });
    });

    context('when no candidate has acquired Cléa', function () {
      it('should return false', async function () {
        // given
        const sessionId = databaseBuilder.factory.buildSession().id;
        const userId = databaseBuilder.factory.buildUser().id;
        const candidate = databaseBuilder.factory.buildCertificationCandidate({ sessionId, userId });
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidate.id });
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
        const hasSomeCleaAcquired = await sessionManagementRepository.hasSomeCleaAcquired({ id: sessionId });

        // then
        expect(hasSomeCleaAcquired).to.be.false;
      });
    });

    context('when the session has no certification course', function () {
      it('should return false', async function () {
        // given
        const sessionId = databaseBuilder.factory.buildSession().id;
        const userId = databaseBuilder.factory.buildUser().id;
        const candidate = databaseBuilder.factory.buildCertificationCandidate({ sessionId, userId });
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidate.id });

        await databaseBuilder.commit();

        // when
        const hasSomeCleaAcquired = await sessionManagementRepository.hasSomeCleaAcquired({ id: sessionId });

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
        const hasSomeCleaAcquired = await sessionManagementRepository.hasSomeCleaAcquired({ id: sessionId });

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
        const candidate = databaseBuilder.factory.buildCertificationCandidate({ sessionId, userId });
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidate.id });
        databaseBuilder.factory.buildCertificationCourse({
          sessionId,
          userId,
        });

        await databaseBuilder.commit();

        // when
        const hasNoStartedCertification = await sessionManagementRepository.hasNoStartedCertification({
          id: sessionId,
        });

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
        const hasNoStartedCertification = await sessionManagementRepository.hasNoStartedCertification({
          id: sessionId,
        });

        // then
        expect(hasNoStartedCertification).to.be.true;
      });
    });
  });
});
