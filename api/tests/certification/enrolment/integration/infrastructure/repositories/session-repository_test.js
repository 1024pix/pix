import * as sessionRepository from '../../../../../../src/certification/enrolment/infrastructure/repositories/session-repository.js';
import { BILLING_MODES } from '../../../../../../src/certification/shared/domain/constants.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Integration | Repository | certification | enrolment | SessionEnrolment', function () {
  describe('#get', function () {
    it('returns the SessionEnrolment model with candidates', async function () {
      const candidateABuilder = domainBuilder.certification.enrolment
        .candidateBuilder()
        .withSubscription(SCOPES.PIX_PLUS_DROIT)
        .withIdentity({ firstName: 'firstName A', lastName: 'lastName A', birthdate: '1991-01-01' })
        .asReconciled({ userId: 111, reconciledAt: new Date('2022-01-01') })
        .withParameters({
          id: 111,
          firstName: 'firstName A',
          lastName: 'lastName A',
          sex: 'M',
          birthPostalCode: 'birthPostalCode A',
          birthINSEECode: 'birthINSEECode A',
          birthCity: 'birthCity A',
          birthProvinceCode: 'birthProvinceCode A',
          birthCountry: 'birthCountry A',
          email: 'email A',
          resultRecipientEmail: 'resultRecipientEmail A',
          externalId: 'externalId A',
          birthdate: '1990-01-01',
          extraTimePercentage: null,
          createdAt: new Date('2021-01-01'),
          organizationLearnerId: null,
          billingMode: BILLING_MODES.FREE,
          prepaymentCode: 'prepaymentCode A',
          hasSeenCertificationInstructions: true,
          accessibilityAdjustmentNeeded: true,
        })
        .withStartedTest({ certification: 111 });
      const candidateBBuilder = domainBuilder.certification.enrolment
        .candidateBuilder()
        .withSubscription(SCOPES.CORE)
        .withIdentity({ firstName: 'firstName B', lastName: 'lastName B', birthdate: '1995-05-05' })
        .asReconciled({ userId: 222, reconciledAt: new Date('2023-03-03') })
        .withParameters({
          id: 222,
          sex: 'F',
          birthPostalCode: 'birthPostalCode B',
          birthINSEECode: 'birthINSEECode B',
          birthCity: 'birthCity B',
          birthProvinceCode: 'birthProvinceCode B',
          birthCountry: 'birthCountry B',
          email: 'email B',
          resultRecipientEmail: 'resultRecipientEmail B',
          externalId: 'externalId B',
          extraTimePercentage: 0.1,
          createdAt: new Date('2021-02-02'),
          organizationLearnerId: null,
          billingMode: BILLING_MODES.PREPAID,
          prepaymentCode: 'prepaymentCode B',
          hasSeenCertificationInstructions: false,
          BccessibilityAdjustmentNeeded: false,
        });
      const expectedSession = domainBuilder.certification.enrolment
        .sessionEnrolmentBuilder()
        .createdBy({
          userId: 123,
          certificationCenterId: 456,
          certificationCenterName: 'Centre de certif fictif',
          certificationCenterType: 'SCO',
        })
        .finalized({ at: new Date('2021-01-01') })
        .withParameters({
          id: 789,
          date: '2026-01-01',
          time: '19:30:05',
          examiner: 'terminator',
          room: 'CFA-330',
          accessCode: 'SOME1ACCESS2CODE',
          address: '2 rue des coquelicots',
          description: 'une description pleine de sens',
          invigilatorPassword: 'INVIG7',
        })
        .addCandidatesBuilders([candidateABuilder, candidateBBuilder])
        .insertToDB({ databaseBuilder });
      await databaseBuilder.commit();

      // when
      const actualSession = await sessionRepository.get({ id: 789 });

      // then
      expect(actualSession).to.deepEqualInstance(expectedSession);
    });

    it('returns null when no session was found', async function () {
      domainBuilder.certification.enrolment
        .sessionEnrolmentBuilder()
        .createdBy({
          userId: 123,
          certificationCenterId: 456,
          certificationCenterName: 'Centre de certif fictif',
          certificationCenterType: 'SCO',
        })
        .finalized({ at: new Date('2021-01-01') })
        .withParameters({
          id: 789,
          date: '2026-01-01',
          time: '19:30:05',
          examiner: 'terminator',
          room: 'CFA-330',
          accessCode: 'SOME1ACCESS2CODE',
          address: '2 rue des coquelicots',
          description: 'une description pleine de sens',
          invigilatorPassword: 'INVIG7',
        })
        .insertToDB({ databaseBuilder });
      await databaseBuilder.commit();

      // when
      const session = await sessionRepository.get({ id: 777 });

      // then
      expect(session).to.be.null;
    });

    it('returns null when the session has no certification center', async function () {
      databaseBuilder.factory.buildSession({ id: 789, certificationCenterId: null });
      await databaseBuilder.commit();

      // when
      const session = await sessionRepository.get({ id: 789 });

      // then
      expect(session).to.be.null;
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
          const result = await sessionRepository.remove({ id: sessionId });

          // then
          const foundSession = await knex('sessions').select('id').where({ id: sessionId }).first();
          expect(foundSession).to.be.undefined;
          expect(result).to.equal(1);
        });
      });
    });

    context('when session does not exist', function () {
      it('return null', async function () {
        // given
        const sessionId = 123456;

        // when
        const result = await sessionRepository.remove({ id: sessionId });

        // then
        expect(result).to.be.null;
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
