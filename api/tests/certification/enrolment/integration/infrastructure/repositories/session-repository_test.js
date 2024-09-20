import { SessionEnrolment } from '../../../../../../src/certification/enrolment/domain/models/SessionEnrolment.js';
import * as sessionRepository from '../../../../../../src/certification/enrolment/infrastructure/repositories/session-repository.js';
import { CERTIFICATION_CENTER_TYPES } from '../../../../../../src/shared/domain/constants.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, databaseBuilder, domainBuilder, expect, knex } from '../../../../../test-helper.js';

describe('Integration | Repository | certification | enrolment | SessionEnrolment', function () {
  describe('#save', function () {
    let session, certificationCenter, sessionCreator;

    beforeEach(async function () {
      certificationCenter = databaseBuilder.factory.buildCertificationCenter({});
      sessionCreator = databaseBuilder.factory.buildUser({});
      session = new SessionEnrolment({
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
        publishedAt: new Date('2017-12-07'),
        resultsSentToPrescriberAt: new Date('2017-12-07'),
        assignedCertificationOfficerId: null,
        accessCode: 'XXXX',
        invigilatorPassword: 'AB2C7A',
        version: 2,
        createdBy: sessionCreator.id,
      });

      await databaseBuilder.commit();
    });

    it('should persist the session in db', async function () {
      // when
      await sessionRepository.save({ session });

      // then
      const sessionSaved = await knex('sessions').select();
      expect(sessionSaved).to.have.lengthOf(1);
    });

    it('should return the saved Session', async function () {
      // when
      const savedSession = await sessionRepository.save({ session });

      // then
      expect(savedSession).to.be.an.instanceOf(SessionEnrolment);
      expect(savedSession).to.have.property('id').and.not.null;
      expect(savedSession).to.deepEqualInstance(new SessionEnrolment({ ...session, id: savedSession.id }));
    });
  });

  describe('#get', function () {
    let sessionDB;
    let sessionCreator;

    beforeEach(async function () {
      // given
      sessionCreator = databaseBuilder.factory.buildUser({});
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
        type: CERTIFICATION_CENTER_TYPES.PRO,
      }).id;
      sessionDB = databaseBuilder.factory.buildSession({
        certificationCenterId,
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
      await databaseBuilder.commit();
    });

    it('should return session informations in a session Object', async function () {
      // when
      const actualSession = await sessionRepository.get({ id: sessionDB.id });

      // then
      expect(actualSession).to.deepEqualInstance(
        domainBuilder.certification.enrolment.buildSession({
          ...sessionDB,
          certificationCenterType: CERTIFICATION_CENTER_TYPES.PRO,
          certificationCandidates: [],
        }),
      );
    });

    it('should return a Not found error when no session was found', async function () {
      // when
      const error = await catchErr(sessionRepository.get)({ id: 2 });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  describe('#update', function () {
    let session;

    beforeEach(function () {
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
        type: CERTIFICATION_CENTER_TYPES.SUP,
      }).id;
      const savedSession = databaseBuilder.factory.buildSession({
        certificationCenterId,
      });
      session = domainBuilder.certification.enrolment.buildSession({
        ...savedSession,
        certificationCenterType: CERTIFICATION_CENTER_TYPES.SUP,
      });
      session.room = 'New room';
      session.examiner = 'New examiner';
      session.address = 'New address';
      session.accessCode = 'BABAAURHUM';
      session.date = '2010-01-01';
      session.time = '12:00:00';
      session.description = 'New description';

      return databaseBuilder.commit();
    });

    it('should update model in database', async function () {
      // when
      await sessionRepository.update(session);

      // then
      const actualSession = await sessionRepository.get({ id: session.id });
      expect(actualSession).to.deepEqualInstance(session);
    });
  });

  describe('#delete', function () {
    context('when session exists', function () {
      context('when the session has candidates', function () {
        it('should remove candidates and delete the session', async function () {
          // given
          const sessionId = databaseBuilder.factory.buildSession().id;
          const candidateA = databaseBuilder.factory.buildCertificationCandidate({ sessionId });
          databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidateA.id });
          const candidateB = databaseBuilder.factory.buildCertificationCandidate({ sessionId });
          databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidateB.id });

          await databaseBuilder.commit();

          // when
          await sessionRepository.remove({ id: sessionId });

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
            databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId });

            const complementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification({
              id: 123,
            }).id;
            databaseBuilder.factory.buildComplementaryCertificationSubscription({
              complementaryCertificationId: complementaryCertificationId,
              certificationCandidateId,
            });

            await databaseBuilder.commit();

            // when
            await sessionRepository.remove({ id: sessionId });

            // then
            const foundSession = await knex('sessions').select('id').where({ id: sessionId }).first();
            const foundSubscriptions = await knex('certification-subscriptions').where({
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
          await sessionRepository.remove({ id: sessionId });

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
          await sessionRepository.remove({ id: sessionId });

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
        const error = await catchErr(sessionRepository.remove)({ id: sessionId });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });

  describe('#isSessionExistingByCertificationCenterId', function () {
    it('should return true if the session already exists', async function () {
      // given
      const session = {
        address: 'rue de Bercy',
        room: 'Salle A',
        examiner: 'madame examinatrice',
        date: '2018-02-23',
        time: '12:00:00',
      };
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildSession({
        ...session,
        examiner: 'Monsieur Examinateur, Madame Examinatrice',
        certificationCenterId,
      });
      await databaseBuilder.commit();

      // when
      const result = await sessionRepository.isSessionExistingByCertificationCenterId({
        ...session,
        certificationCenterId,
      });

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
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      await databaseBuilder.commit();

      // when
      const result = await sessionRepository.isSessionExistingByCertificationCenterId({
        ...session,
        certificationCenterId,
      });

      // then
      expect(result).to.equal(false);
    });
  });

  describe('#isSessionExistingBySessionAndCertificationCenterIds', function () {
    context('when session exists', function () {
      it('should return true', async function () {
        // given
        const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
        const session = databaseBuilder.factory.buildSession({
          certificationCenterId: certificationCenter.id,
        });
        await databaseBuilder.commit();

        // when
        const result = await sessionRepository.isSessionExistingBySessionAndCertificationCenterIds({
          sessionId: session.id,
          certificationCenterId: certificationCenter.id,
        });

        // then
        expect(result).to.be.true;
      });
    });

    context('when session does not exist', function () {
      it('should return false', async function () {
        // given
        const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
        databaseBuilder.factory.buildSession({
          id: 567,
          certificationCenterId: certificationCenter.id,
        });
        await databaseBuilder.commit();

        // when
        const result = await sessionRepository.isSessionExistingBySessionAndCertificationCenterIds({
          sessionId: 678,
          certificationCenterId: certificationCenter.id,
        });

        // then
        expect(result).to.be.false;
      });
    });
  });
});
