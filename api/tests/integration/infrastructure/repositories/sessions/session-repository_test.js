const { databaseBuilder, expect, knex, domainBuilder, catchErr } = require('../../../../test-helper');
const _ = require('lodash');
const { NotFoundError } = require('../../../../../lib/domain/errors');
const Session = require('../../../../../lib/domain/models/Session');
const { statuses } = require('../../../../../lib/domain/models/Session');
const sessionRepository = require('../../../../../lib/infrastructure/repositories/sessions/session-repository');

describe('Integration | Repository | Session', function () {
  describe('#save', function () {
    let session, certificationCenter;

    beforeEach(async function () {
      certificationCenter = databaseBuilder.factory.buildCertificationCenter({});
      session = new Session({
        certificationCenter: certificationCenter.name,
        certificationCenterId: certificationCenter.id,
        address: 'Nice',
        room: '28D',
        examiner: 'Michel Essentiel',
        date: '2017-12-08',
        time: '14:30:00',
        description: 'Première certification EVER !!!',
        examinerGlobalComment: 'No comment',
        hasIncident: true,
        hasJoiningIssue: true,
        finalizedAt: new Date('2017-12-07'),
        publishedAt: new Date('2017-12-07'),
        resultsSentToPrescriberAt: new Date('2017-12-07'),
        assignedCertificationOfficerId: null,
        accessCode: 'XXXX',
        supervisorPassword: 'AB2C7',
      });

      await databaseBuilder.commit();
    });

    afterEach(function () {
      return knex('sessions').delete();
    });

    it('should persist the session in db', async function () {
      // when
      await sessionRepository.save(session);

      // then
      const sessionSaved = await knex('sessions').select();
      expect(sessionSaved).to.have.lengthOf(1);
    });

    it('should return the saved Session', async function () {
      // when
      const savedSession = await sessionRepository.save(session);

      // then
      expect(savedSession).to.be.an.instanceOf(Session);
      expect(savedSession).to.have.property('id').and.not.null;
      expect(savedSession).to.deepEqualInstance(new Session({ ...session, id: savedSession.id }));
    });
  });

  describe('#isSessionCodeAvailable', function () {
    beforeEach(function () {
      databaseBuilder.factory.buildSession({
        certificationCenter: 'Paris',
        address: 'Paris',
        room: 'The lost room',
        examiner: 'Bernard',
        date: '2018-02-23',
        time: '12:00',
        description: 'The lost examen',
        accessCode: 'ABCD12',
      });

      return databaseBuilder.commit();
    });

    it('should return true if the accessCode is not in database', async function () {
      // given
      const accessCode = 'DEFG34';

      // when
      const isAvailable = await sessionRepository.isSessionCodeAvailable(accessCode);

      // then
      expect(isAvailable).to.be.equal(true);
    });

    it('should return false if the accessCode is in database', async function () {
      // given
      const accessCode = 'ABCD12';

      // when
      const isAvailable = await sessionRepository.isSessionCodeAvailable(accessCode);

      // then
      expect(isAvailable).to.be.equal(false);
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
      const isFinalized = await sessionRepository.isFinalized(finalizedSessionId);

      // then
      expect(isFinalized).to.be.equal(true);
    });

    it('should return false if the session status is not finalized', async function () {
      // when
      const isFinalized = await sessionRepository.isFinalized(notFinalizedSessionId);

      // then
      expect(isFinalized).to.be.equal(false);
    });
  });

  describe('#get', function () {
    let session;
    let expectedSessionValues;

    beforeEach(async function () {
      // given
      session = databaseBuilder.factory.buildSession({
        certificationCenter: 'Tour Gamma',
        address: 'rue de Bercy',
        room: 'Salle A',
        examiner: 'Monsieur Examinateur',
        date: '2018-02-23',
        time: '12:00:00',
        description: 'CertificationPix pour les jeunes',
        accessCode: 'NJR10',
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
      };
      await databaseBuilder.commit();
    });

    it('should return session informations in a session Object', async function () {
      // when
      const actualSession = await sessionRepository.get(session.id);

      // then
      expect(actualSession).to.be.instanceOf(Session);
      expect(actualSession, 'date').to.deep.includes(expectedSessionValues);
    });

    it('should return a Not found error when no session was found', async function () {
      // when
      const error = await catchErr(sessionRepository.get)(2);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  describe('#getWithCertificationCandidates', function () {
    it('should return session information in a session Object', async function () {
      // given
      const session = databaseBuilder.factory.buildSession({
        certificationCenter: 'Tour Gamma',
        address: 'rue de Bercy',
        room: 'Salle A',
        examiner: 'Monsieur Examinateur',
        date: '2018-02-23',
        time: '12:00:00',
        description: 'CertificationPix pour les jeunes',
        accessCode: 'NJR10',
      });
      await databaseBuilder.commit();

      // when
      const actualSession = await sessionRepository.getWithCertificationCandidates(session.id);

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
      const actualSession = await sessionRepository.getWithCertificationCandidates(session.id);

      // then
      const actualCandidates = _.map(actualSession.certificationCandidates, (item) =>
        _.pick(item, ['sessionId', 'lastName', 'firstName'])
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
      const actualSession = await sessionRepository.getWithCertificationCandidates(session.id);

      // then
      expect(actualSession.certificationCandidates).to.deep.equal([]);
    });

    it('should return candidates complementary certifications', async function () {
      // given
      const session = databaseBuilder.factory.buildSession();
      const pixPlusFoot = databaseBuilder.factory.buildComplementaryCertification({ label: 'Pix+ Foot', key: 'FOOT' });
      const pixPlusRugby = databaseBuilder.factory.buildComplementaryCertification({
        label: 'Pix+ Rugby',
        key: 'RUGBY',
      });
      const pixPlusTennis = databaseBuilder.factory.buildComplementaryCertification({
        label: 'Pix+ Tennis',
        key: 'TENNIS',
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
      databaseBuilder.factory.buildComplementaryCertificationSubscription({
        certificationCandidateId: secondCandidate.id,
        complementaryCertificationId: pixPlusTennis.id,
      });
      await databaseBuilder.commit();

      // when
      const actualSession = await sessionRepository.getWithCertificationCandidates(session.id);

      // then
      const [firstCandidateFromSession, secondCandidateFromSession] = actualSession.certificationCandidates;
      expect(firstCandidateFromSession.complementaryCertifications).to.deep.equal([
        domainBuilder.buildComplementaryCertification(pixPlusRugby),
      ]);
      expect(secondCandidateFromSession.complementaryCertifications).to.deep.equal([
        domainBuilder.buildComplementaryCertification(pixPlusFoot),
        domainBuilder.buildComplementaryCertification(pixPlusTennis),
      ]);
    });

    it('should return an empty candidates complementary certifications if there is no complementary certifications', async function () {
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
      const actualSession = await sessionRepository.getWithCertificationCandidates(session.id);

      // then
      const [firstCandidateFromSession, secondCandidateFromSession] = actualSession.certificationCandidates;
      expect(firstCandidateFromSession.complementaryCertifications).to.deep.equal([]);
      expect(secondCandidateFromSession.complementaryCertifications).to.deep.equal([]);
    });

    it('should return a Not found error when no session was found', async function () {
      // given
      const session = databaseBuilder.factory.buildSession();
      await databaseBuilder.commit();

      // when
      const error = await catchErr(sessionRepository.get)(session.id + 1);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  describe('#updateSessionInfo', function () {
    let session;

    beforeEach(function () {
      const savedSession = databaseBuilder.factory.buildSession();
      session = domainBuilder.buildSession(savedSession);
      session.room = 'New room';
      session.examiner = 'New examiner';
      session.address = 'New address';
      session.accessCode = 'BABAAURHUM';
      session.date = '2010-01-01';
      session.time = '12:00:00';
      session.description = 'New description';

      return databaseBuilder.commit();
    });

    it('should return a Session domain object', async function () {
      // when
      const sessionSaved = await sessionRepository.updateSessionInfo(session);

      // then
      expect(sessionSaved).to.be.an.instanceof(Session);
    });

    it('should update model in database', async function () {
      // given

      // when
      const sessionSaved = await sessionRepository.updateSessionInfo(session);

      // then
      expect(sessionSaved.id).to.equal(session.id);
      expect(sessionSaved.room).to.equal(session.room);
      expect(sessionSaved.examiner).to.equal(session.examiner);
      expect(sessionSaved.address).to.equal(session.address);
      expect(sessionSaved.accessCode).to.equal(session.accessCode);
      expect(sessionSaved.date).to.equal(session.date);
      expect(sessionSaved.time).to.equal(session.time);
      expect(sessionSaved.description).to.equal(session.description);
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
      const hasMembership = await sessionRepository.doesUserHaveCertificationCenterMembershipForSession(
        userId,
        sessionId
      );

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
      const hasMembership = await sessionRepository.doesUserHaveCertificationCenterMembershipForSession(
        userId,
        sessionId
      );

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
      const hasMembership = await sessionRepository.doesUserHaveCertificationCenterMembershipForSession(
        userIdNotAllowed,
        sessionId
      );

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
      expect(sessionSaved.status).to.deep.equal(statuses.FINALIZED);
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

  describe('#isSco', function () {
    context('when the certification center is not SCO', function () {
      it('should return false', async function () {
        // given
        const certificationCenter = databaseBuilder.factory.buildCertificationCenter({
          name: 'PRO_CERTIFICATION_CENTER',
          type: 'PRO',
          externalId: 'EXTERNAL_ID',
        });

        const session = databaseBuilder.factory.buildSession({
          certificationCenter: certificationCenter.name,
          certificationCenterId: certificationCenter.id,
          finalizedAt: null,
          publishedAt: null,
        });

        await databaseBuilder.commit();

        // when
        const result = await sessionRepository.isSco({
          sessionId: session.id,
        });

        // then
        expect(result).to.be.false;
      });
    });

    context('when the certification center is SCO', function () {
      it('should return true', async function () {
        // given
        const certificationCenter = databaseBuilder.factory.buildCertificationCenter({
          name: 'SCO',
          externalId: 'EXTERNAL_ID',
          type: 'SCO',
        });

        const session = databaseBuilder.factory.buildSession({
          certificationCenter: certificationCenter.name,
          certificationCenterId: certificationCenter.id,
          finalizedAt: null,
          publishedAt: null,
        });

        await databaseBuilder.commit();

        // when
        const result = await sessionRepository.isSco({
          sessionId: session.id,
        });

        // then
        expect(result).to.be.true;
      });
    });
  });

  describe('#delete', function () {
    context('when session exists', function () {
      context('when the session has candidates', function () {
        it('should remove candidates and delete the session', async function () {
          // given
          const sessionId = databaseBuilder.factory.buildSession().id;
          databaseBuilder.factory.buildCertificationCandidate({ sessionId });
          databaseBuilder.factory.buildCertificationCandidate({ sessionId });

          await databaseBuilder.commit();

          // when
          await sessionRepository.delete(sessionId);

          // then
          const foundSession = await knex('sessions').select('id').where({ id: sessionId }).first();
          const candidates = await knex('certification-candidates').where({ sessionId });
          expect(foundSession).to.be.undefined;
          expect(candidates).to.be.empty;
        });

        context('when candidates have complementary certification subscriptions', function () {
          it('should remove complementary certification subscriptions', async function () {
            // given
            const sessionId = databaseBuilder.factory.buildSession().id;
            const certificationCandidateId = databaseBuilder.factory.buildCertificationCandidate({ sessionId }).id;

            const complementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification({
              id: 123,
            }).id;
            databaseBuilder.factory.buildComplementaryCertificationSubscription({
              complementaryCertificationId: complementaryCertificationId,
              certificationCandidateId,
            });

            await databaseBuilder.commit();

            // when
            await sessionRepository.delete(sessionId);

            // then
            const foundSession = await knex('sessions').select('id').where({ id: sessionId }).first();
            const foundSubscriptions = await knex('complementary-certification-subscriptions').where({
              certificationCandidateId,
            });
            expect(foundSession).to.be.undefined;
            expect(foundSubscriptions).to.be.empty;
          });
        });
      });

      context('when the session has been accessed by one or more supervisor', function () {
        it('should remove supervisor accesses and delete the session', async function () {
          // given
          const sessionId = databaseBuilder.factory.buildSession().id;
          databaseBuilder.factory.buildSupervisorAccess({ sessionId });
          databaseBuilder.factory.buildSupervisorAccess({ sessionId });

          await databaseBuilder.commit();

          // when
          await sessionRepository.delete(sessionId);

          // then
          const foundSession = await knex('sessions').select('id').where({ id: sessionId }).first();
          const supervisorAccesses = await knex('supervisor-accesses').where({ sessionId });
          expect(foundSession).to.be.undefined;
          expect(supervisorAccesses).to.be.empty;
        });
      });

      context('when the session has no candidates', function () {
        it('should delete the session', async function () {
          // given
          const sessionId = databaseBuilder.factory.buildSession().id;

          await databaseBuilder.commit();

          // when
          await sessionRepository.delete(sessionId);

          // then
          const foundSession = await knex('sessions').select('id').where({ id: sessionId }).first();
          expect(foundSession).to.be.undefined;
        });
      });
    });

    context('when session does not exist', function () {
      it('should throw a not found error', async function () {
        // given
        const sessionId = 123456;

        // when
        const error = await catchErr(sessionRepository.delete)(sessionId);

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
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
          const hasSomeCleaAcquired = await sessionRepository.hasSomeCleaAcquired(sessionId);

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
        const hasSomeCleaAcquired = await sessionRepository.hasSomeCleaAcquired(sessionId);

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
        const hasSomeCleaAcquired = await sessionRepository.hasSomeCleaAcquired(sessionId);

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
        const hasSomeCleaAcquired = await sessionRepository.hasSomeCleaAcquired(sessionId);

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
        const hasSomeCleaAcquired = await sessionRepository.hasSomeCleaAcquired(sessionId);

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
        const hasNoStartedCertification = await sessionRepository.hasNoStartedCertification(sessionId);

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
        const hasNoStartedCertification = await sessionRepository.hasNoStartedCertification(sessionId);

        // then
        expect(hasNoStartedCertification).to.be.true;
      });
    });
  });

  describe('#countUncompletedCertifications', function () {
    context('when session has at least one uncompleted certification course', function () {
      it('should return the count of uncompleted certification courses', async function () {
        // given
        const sessionId = databaseBuilder.factory.buildSession({}).id;
        const userId1 = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildCertificationCandidate({ sessionId, userId: userId1 });
        databaseBuilder.factory.buildCertificationCourse({
          sessionId,
          userId: userId1,
          completedAt: null,
        });
        const userId2 = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildCertificationCandidate({ sessionId, userId: userId2 });
        databaseBuilder.factory.buildCertificationCourse({
          sessionId,
          userId: userId2,
          completedAt: null,
        });

        await databaseBuilder.commit();

        // when
        const unfinishedCertificationsCount = await sessionRepository.countUncompletedCertifications(sessionId);

        // then
        expect(unfinishedCertificationsCount).to.equal(2);
      });
    });
  });

  describe('#getExistingSessionByInformation', function () {
    it('should return true if the session already exists', async function () {
      // given
      const session = {
        address: 'rue de Bercy',
        room: 'Salle A',
        examiner: 'madame examinatrice',
        date: '2018-02-23',
        time: '12:00:00',
      };
      databaseBuilder.factory.buildSession({ ...session, examiner: 'Monsieur Examinateur, Madame Examinatrice' });

      await databaseBuilder.commit();

      // when
      const result = await sessionRepository.getExistingSessionByInformation({ ...session });

      // then
      expect(result).to.equal(true);
    });

    it('should return false if the session does not already exist', async function () {
      // given
      const session = {
        address: 'rue de Bercy',
        room: 'Salle A',
        examiner: 'Monsieur Examinateur',
        date: '2018-02-23',
        time: '12:00:00',
      };

      // when
      const result = await sessionRepository.getExistingSessionByInformation({ ...session });

      // then
      expect(result).to.equal(false);
    });
  });
});
