import { Candidate } from '../../../../../../src/certification/enrolment/domain/models/Candidate.js';
import * as candidateRepository from '../../../../../../src/certification/enrolment/infrastructure/repositories/candidate-repository.js';
import { CertificationCandidateNotFoundError } from '../../../../../../src/certification/shared/domain/errors.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Integration | Certification | Enrolment | Repository | Candidate', function () {
  describe('#get', function () {
    context('when the candidate exists', function () {
      it('should return the candidate', async function () {
        // given
        const certificationCandidate = databaseBuilder.factory.buildCertificationCandidate({
          subscription: Frameworks.CLEA,
        });
        await databaseBuilder.commit();

        // when
        const result = await candidateRepository.get({ certificationCandidateId: certificationCandidate.id });

        // then
        expect(result).to.deepEqualInstance(new Candidate({ ...certificationCandidate, hasStartedTest: false }));
      });
    });

    context('when the candidate has an associated certification course', function () {
      it('should return the candidate with information on whether he/she started the test', async function () {
        // given
        const certificationCandidate = databaseBuilder.factory.buildCertificationCandidate();
        databaseBuilder.factory.buildCertificationCourse({
          userId: certificationCandidate.userId,
          candidateId: certificationCandidate.id,
        });
        await databaseBuilder.commit();

        // when
        const result = await candidateRepository.get({ certificationCandidateId: certificationCandidate.id });

        // then
        expect(result).to.deepEqualInstance(new Candidate({ ...certificationCandidate, hasStartedTest: true }));
      });
    });

    context('when the candidate does not exist', function () {
      it('return null', async function () {
        // given
        const wrongCertificationCandidateId = 4568;

        //when
        const result = await candidateRepository.get({ certificationCandidateId: wrongCertificationCandidateId });

        // then
        expect(result).to.be.null;
      });
    });
  });

  describe('#findBySessionId', function () {
    context('when there are candidates', function () {
      it('should return the candidates', async function () {
        // given
        const sessionId = databaseBuilder.factory.buildSession().id;
        const certificationCandidate1 = databaseBuilder.factory.buildCertificationCandidate({
          sessionId,
          subscription: Frameworks.CLEA,
        });
        const certificationCandidate2 = databaseBuilder.factory.buildCertificationCandidate({
          firstName: 'FiFouLaPraline',
          sessionId,
        });
        databaseBuilder.factory.buildCertificationCandidate();
        await databaseBuilder.commit();

        // when
        const result = await candidateRepository.findBySessionId({ sessionId });

        // then
        expect(result).to.deepEqualArray([
          domainBuilder.certification.enrolment.buildCandidate({ ...certificationCandidate1 }),
          domainBuilder.certification.enrolment.buildCandidate({ ...certificationCandidate2 }),
        ]);
      });
    });

    context('when there are no candidate', function () {
      it('returns empty array', async function () {
        // given
        const sessionId = databaseBuilder.factory.buildSession().id;
        const otherSessionId = databaseBuilder.factory.buildSession().id;
        databaseBuilder.factory.buildCertificationCandidate({ sessionId });
        await databaseBuilder.commit();

        //when
        const result = await candidateRepository.findBySessionId({ sessionId: otherSessionId });

        // then
        expect(result).to.be.empty;
      });
    });
  });

  describe('#findByUserId', function () {
    context('when there are candidates', function () {
      it('should return the candidates', async function () {
        // given
        const candidate1 = databaseBuilder.factory.buildCertificationCandidate();
        const userId = candidate1.userId;
        const candidate2 = databaseBuilder.factory.buildCertificationCandidate({ userId });
        databaseBuilder.factory.buildCertificationCandidate();
        await databaseBuilder.commit();

        // when
        const result = await candidateRepository.findByUserId({ userId });

        // then
        expect(result).to.deepEqualArray([
          domainBuilder.certification.enrolment.buildCandidate({ ...candidate1 }),
          domainBuilder.certification.enrolment.buildCandidate({ ...candidate2 }),
        ]);
      });
    });

    context('when there are no candidates', function () {
      it('returns an empty array', async function () {
        //when
        const result = await candidateRepository.findByUserId({ userId: 123 });

        // then
        expect(result).to.be.empty;
      });
    });
  });

  describe('#update', function () {
    context('when the candidate exists', function () {
      it('should update the candidate', async function () {
        // when
        const certificationCandidate = databaseBuilder.factory.buildCertificationCandidate({ firstName: 'toto' });
        await databaseBuilder.commit();
        const certificationCandidateToUpdate = domainBuilder.certification.enrolment.buildCandidate({
          ...certificationCandidate,
        });
        certificationCandidateToUpdate.firstName = 'tutu';

        // when
        await candidateRepository.update(certificationCandidateToUpdate);
        const candidate = await candidateRepository.get({
          certificationCandidateId: certificationCandidate.id,
        });

        // then
        expect(candidate).to.be.instanceOf(Candidate);
        expect(candidate.firstName).to.equal('tutu');
      });

      it('should update its subscription', async function () {
        // given
        const certificationCandidate = databaseBuilder.factory.buildCertificationCandidate({
          subscription: Frameworks.DROIT,
        });
        await databaseBuilder.commit();

        const certificationCandidateToUpdate = domainBuilder.certification.enrolment.buildCandidate({
          ...certificationCandidate,
          subscription: Frameworks.EDU_1ER_DEGRE,
        });

        // when
        await candidateRepository.update(certificationCandidateToUpdate);

        // then
        const updated = await candidateRepository.get({ certificationCandidateId: certificationCandidate.id });
        expect(updated.subscription).to.equal(Frameworks.EDU_1ER_DEGRE);
      });
    });

    context('when the candidate does not exist', function () {
      it('should throw', async function () {
        // when
        const certificationCandidateToUpdate = domainBuilder.certification.enrolment.buildCertificationSessionCandidate(
          { firstName: 'candidate unknown' },
        );

        certificationCandidateToUpdate.firstName = 'tutu';

        const error = await catchErr(candidateRepository.update)(certificationCandidateToUpdate);

        // then
        expect(error).to.be.instanceOf(CertificationCandidateNotFoundError);
      });
    });
  });

  describe('#insert', function () {
    let candidateData;

    beforeEach(function () {
      candidateData = {
        id: null,
        createdAt: new Date('2020-01-01'),
        firstName: 'Jean-Charles',
        lastName: 'Quiberon',
        sex: 'M',
        birthPostalCode: 'Code postal',
        birthINSEECode: 'Insee code',
        birthCity: 'Ma ville',
        birthProvinceCode: 'Mon département',
        birthCountry: 'Mon pays',
        email: 'jc.quiberon@example.net',
        resultRecipientEmail: 'ma_maman@example.net',
        birthdate: '1990-05-06',
        extraTimePercentage: 0.3,
        externalId: 'JCQUIB',
        userId: null,
        sessionId: 888,
        organizationLearnerId: null,
        authorizedToStart: false,
        complementaryCertificationId: null,
        billingMode: null,
        prepaymentCode: null,
        hasSeenCertificationInstructions: false,
        accessibilityAdjustmentNeeded: false,
        reconciledAt: null,
        subscription: Frameworks.DROIT,
      };
      databaseBuilder.factory.buildSession({ id: candidateData.sessionId });
      return databaseBuilder.commit();
    });

    it('should insert candidate in DB', async function () {
      // given
      const candidateToInsert = domainBuilder.certification.enrolment.buildCandidate(candidateData);

      // when
      const candidateId = await candidateRepository.insert(candidateToInsert);

      // then
      const savedCandidateData = await knex('certification-candidates').select('*').where({ id: candidateId }).first();
      expect(savedCandidateData).to.deepEqualInstanceOmitting(candidateData, [
        'id',
        'createdAt',
        'complementaryCertificationId',
        'extraTimePercentage',
      ]);
      expect(parseFloat(savedCandidateData.extraTimePercentage)).to.equal(candidateData.extraTimePercentage);
      expect(savedCandidateData.subscription).to.equal(Frameworks.DROIT);
    });
  });

  describe('#save', function () {
    it("should insert session's candidates in DB with their subscriptions", async function () {
      // given
      const sessionId = databaseBuilder.factory.buildSession({}).id;
      await databaseBuilder.commit();
      const candidateA = domainBuilder.certification.enrolment.buildCandidate({
        firstName: 'Lolo',
        lastName: 'Lapraline',
        accessibilityAdjustmentNeeded: true,
        sessionId,
        subscription: Frameworks.CLEA,
      });
      const candidateB = domainBuilder.certification.enrolment.buildCandidate({
        firstName: 'Geogeo',
        lastName: 'Lenougat',
        accessibilityAdjustmentNeeded: true,
        sessionId,
      });
      const candidateC = domainBuilder.certification.enrolment.buildCandidate({
        firstName: 'Loulou',
        lastName: 'Lapistache',
        sessionId,
        accessibilityAdjustmentNeeded: false,
        subscription: Frameworks.DROIT,
      });

      // when
      await candidateRepository.save({ candidates: [candidateA, candidateB, candidateC] });

      // then
      const savedA = await knex('certification-candidates').select('*').where({ firstName: 'Lolo' }).first();
      const savedB = await knex('certification-candidates').select('*').where({ firstName: 'Geogeo' }).first();
      const savedC = await knex('certification-candidates').select('*').where({ firstName: 'Loulou' }).first();

      expect(savedA.subscription).to.equal(Frameworks.CLEA);
      expect(savedB.subscription).to.equal(Frameworks.CORE);
      expect(savedC.subscription).to.equal(Frameworks.DROIT);
    });
  });
});
