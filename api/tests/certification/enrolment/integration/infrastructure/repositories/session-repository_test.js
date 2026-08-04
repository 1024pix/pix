import { SessionEnrolment } from '../../../../../../src/certification/enrolment/domain/models/SessionEnrolment.js';
import * as sessionRepository from '../../../../../../src/certification/enrolment/infrastructure/repositories/session-repository.js';
import { CERTIFICATION_CENTER_TYPES } from '../../../../../../src/shared/constants.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

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

  describe('#updateInfo', function () {
    it('should update session in database', async function () {
      domainBuilder.certification.enrolment
        .sessionEnrolmentBuilder()
        .createdBy({
          userId: 1,
          certificationCenterId: 2,
          certificationCenterName: 'mon centre',
          certificationCenterType: 'SUP',
        })
        .withParameters({
          id: 123,
          address: '1 rue des lauriers OLD',
          room: '2B OLD',
          date: '2020-02-02',
          time: '15:00:00',
          examiner: 'Louise OLD',
          description: 'coucou OLD',
        })
        .insertToDB({ databaseBuilder });
      await databaseBuilder.commit();

      // when
      await sessionRepository.updateInfo({
        id: 123,
        address: '1 rue des lauriers',
        room: '2B',
        date: '2021-01-01',
        time: '14:00:00',
        examiner: 'Louise',
        description: 'coucou',
      });

      // then
      const actualSession = await sessionRepository.get({ id: 123 });
      expect(actualSession).to.deepEqualInstance(
        domainBuilder.certification.enrolment
          .sessionEnrolmentBuilder()
          .withParameters({
            id: 123,
            address: '1 rue des lauriers',
            room: '2B',
            date: '2021-01-01',
            time: '14:00:00',
            examiner: 'Louise',
            description: 'coucou',
          })
          .createdBy({
            userId: 1,
            certificationCenterId: 2,
            certificationCenterName: 'mon centre',
            certificationCenterType: 'SUP',
          })
          .build(),
      );
    });
  });

  describe('#create', function () {
    it('should create session in database', async function () {
      databaseBuilder.factory.buildCertificationCenter({ id: 1, name: 'Mon centre stylé', type: 'SUP' });
      databaseBuilder.factory.buildCertificationCenter({ id: 2, name: 'Un centre inintéressant', type: 'PRO' });
      databaseBuilder.factory.buildUser({ id: 123 });
      await databaseBuilder.commit();

      // when
      const sessionId = await sessionRepository.create({
        userId: 123,
        certificationCenterId: 1,
        address: '1 rue des lauriers',
        room: '2B',
        date: '2021-01-01',
        time: '14:00:00',
        examiner: 'Louise',
        description: 'coucou',
        accessCode: 'MONCODE123',
        invigilatorPassword: 'INVIGI',
      });

      // then
      const actualSession = await sessionRepository.get({ id: sessionId });
      expect(actualSession).to.deepEqualInstance(
        domainBuilder.certification.enrolment
          .sessionEnrolmentBuilder()
          .withParameters({
            id: sessionId,
            address: '1 rue des lauriers',
            room: '2B',
            date: '2021-01-01',
            time: '14:00:00',
            examiner: 'Louise',
            description: 'coucou',
            invigilatorPassword: 'INVIGI',
            accessCode: 'MONCODE123',
          })
          .createdBy({
            userId: 123,
            certificationCenterId: 1,
            certificationCenterName: 'Mon centre stylé',
            certificationCenterType: 'SUP',
          })
          .build(),
      );
    });
  });

  describe('#remove', function () {
    context('when session exists', function () {
      context('when the session has candidates', function () {
        it('should remove candidates and delete the session', async function () {
          // given
          const sessionId = databaseBuilder.factory.buildSession().id;
          domainBuilder.certification.enrolment
            .candidateBuilder()
            .withParameters({ sessionId })
            .insertToDB({ databaseBuilder });
          domainBuilder.certification.enrolment
            .candidateBuilder()
            .withParameters({ sessionId })
            .insertToDB({ databaseBuilder });

          await databaseBuilder.commit();

          // when
          await sessionRepository.remove({ id: sessionId });

          // then
          const foundSession = await knex('sessions').select('id').where({ id: sessionId }).first();
          const candidates = await knex('certification-candidates').where({ sessionId });
          expect(foundSession).to.be.undefined;
          expect(candidates).to.be.empty;
        });
      });

      context('when the session has been accessed by one or more invigilator', function () {
        it('should remove invigilator accesses and delete the session', async function () {
          // given
          const sessionId = databaseBuilder.factory.buildSession().id;
          databaseBuilder.factory.buildInvigilatorAccess({ sessionId });
          databaseBuilder.factory.buildInvigilatorAccess({ sessionId });

          await databaseBuilder.commit();

          // when
          await sessionRepository.remove({ id: sessionId });

          // then
          const foundSession = await knex('sessions').select('id').where({ id: sessionId }).first();
          const invigilatorAccesses = await knex('invigilator_accesses').where({ sessionId });
          expect(foundSession).to.be.undefined;
          expect(invigilatorAccesses).to.be.empty;
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

    it('should return false if the only matching session is the excluded one', async function () {
      // given
      const session = {
        address: 'rue de Bercy',
        room: 'Salle A',
        examiner: 'madame examinatrice',
        date: '2018-02-23',
        time: '12:00:00',
      };
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const existingSession = databaseBuilder.factory.buildSession({
        ...session,
        certificationCenterId,
      });
      await databaseBuilder.commit();

      // when
      const result = await sessionRepository.isSessionExistingByCertificationCenterId({
        ...session,
        certificationCenterId,
        excludeSessionId: existingSession.id,
      });

      // then
      expect(result).to.equal(false);
    });
  });
});
