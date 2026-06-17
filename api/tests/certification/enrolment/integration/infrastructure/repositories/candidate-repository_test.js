import { Candidate } from '../../../../../../src/certification/enrolment/domain/models/Candidate.js';
import * as candidateRepository from '../../../../../../src/certification/enrolment/infrastructure/repositories/candidate-repository.js';
import { CertificationCandidateNotFoundError } from '../../../../../../src/certification/shared/domain/errors.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
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
        const certificationCandidate = databaseBuilder.factory.buildCertificationCandidate({
          firstName: 'toto',
        });
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: certificationCandidate.id });
        await databaseBuilder.commit();
        const certificationCandidateToUpdate = domainBuilder.certification.enrolment.buildCandidate({
          ...certificationCandidate,
          subscriptions: [
            domainBuilder.certification.enrolment.buildCoreSubscription({
              certificationCandidateId: certificationCandidate.id,
            }),
          ],
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
        const droitCertification = databaseBuilder.factory.buildComplementaryCertification({ key: Frameworks.DROIT });
        databaseBuilder.factory.buildComplementaryCertification({ key: Frameworks.EDU_1ER_DEGRE });
        const certificationCandidate = databaseBuilder.factory.buildCertificationCandidate({
          subscription: Frameworks.DROIT,
        });
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: certificationCandidate.id });
        databaseBuilder.factory.buildComplementaryCertificationSubscription({
          certificationCandidateId: certificationCandidate.id,
          complementaryCertificationId: droitCertification.id,
        });
        await databaseBuilder.commit();

        const candidateToUpdate = domainBuilder.certification.enrolment.buildCandidate({
          ...certificationCandidate,
          subscription: Frameworks.EDU_1ER_DEGRE,
        });

        // when
        await candidateRepository.update(candidateToUpdate);

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

  describe('#save', function () {
    it("should insert session's candidates in DB with their subscriptions", async function () {
      // given
      databaseBuilder.factory.buildComplementaryCertification.clea({}).id;
      databaseBuilder.factory.buildComplementaryCertification.droit({}).id;
      const sessionId = databaseBuilder.factory.buildSession({}).id;
      await databaseBuilder.commit();
      const candidateA = domainBuilder.certification.enrolment.buildCandidate({
        firstName: 'Lolo',
        lastName: 'Lapraline',
        accessibilityAdjustmentNeeded: true,
        sessionId,
        subscriptions: [
          domainBuilder.certification.enrolment.buildCoreSubscription(),
          domainBuilder.certification.enrolment.buildComplementarySubscription({
            complementaryCertificationKey: Frameworks.CLEA,
          }),
        ],
        subscription: Frameworks.CLEA,
      });
      const candidateB = domainBuilder.certification.enrolment.buildCandidate({
        firstName: 'Geogeo',
        lastName: 'Lenougat',
        accessibilityAdjustmentNeeded: true,
        sessionId,
        subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription()],
      });
      const candidateC = domainBuilder.certification.enrolment.buildCandidate({
        firstName: 'Loulou',
        lastName: 'Lapistache',
        sessionId,
        accessibilityAdjustmentNeeded: false,
        subscriptions: [
          domainBuilder.certification.enrolment.buildComplementarySubscription({
            complementaryCertificationKey: Frameworks.DROIT,
          }),
        ],
        subscription: Frameworks.DROIT,
      });

      // when
      const savedCandidates = await candidateRepository.save({ candidates: [candidateA, candidateB, candidateC] });

      // then
      const candidatesInSession = await candidateRepository.findBySessionId({ sessionId });
      expect(savedCandidates).to.deepEqualArray(candidatesInSession);
      const { id: idCandidateA, createdAt: createdAtA } = savedCandidates.find(
        (savedCandidate) => savedCandidate.firstName === candidateA.firstName,
      );
      const { id: idCandidateB, createdAt: createdAtB } = savedCandidates.find(
        (savedCandidate) => savedCandidate.firstName === candidateB.firstName,
      );
      const { id: idCandidateC, createdAt: createdAtC } = savedCandidates.find(
        (savedCandidate) => savedCandidate.firstName === candidateC.firstName,
      );
      expect(savedCandidates).to.deepEqualArray([
        domainBuilder.certification.enrolment.buildCandidate({
          id: idCandidateA,
          createdAt: createdAtA,
          firstName: candidateA.firstName,
          reconciledAt: null,
          lastName: candidateA.lastName,
          birthCity: candidateA.birthCity,
          externalId: candidateA.externalId,
          extraTimePercentage: candidateB.extraTimePercentage,
          birthdate: candidateA.birthdate,
          sessionId: sessionId,
          birthProvinceCode: candidateA.birthProvinceCode,
          birthCountry: candidateA.birthCountry,
          userId: null,
          email: candidateA.email,
          resultRecipientEmail: candidateA.resultRecipientEmail,
          organizationLearnerId: candidateA.organizationLearnerId,
          birthPostalCode: candidateA.birthPostalCode,
          birthINSEECode: candidateA.birthINSEECode,
          sex: candidateA.sex,
          authorizedToStart: false,
          billingMode: candidateA.billingMode,
          prepaymentCode: candidateA.prepaymentCode,
          hasSeenCertificationInstructions: false,
          accessibilityAdjustmentNeeded: candidateA.accessibilityAdjustmentNeeded,
          subscription: Frameworks.CLEA,
          hasStartedTest: false,
        }),
        domainBuilder.certification.enrolment.buildCandidate({
          id: idCandidateB,
          createdAt: createdAtB,
          firstName: candidateB.firstName,
          reconciledAt: null,
          lastName: candidateB.lastName,
          birthCity: candidateB.birthCity,
          externalId: candidateB.externalId,
          extraTimePercentage: candidateB.extraTimePercentage,
          birthdate: candidateB.birthdate,
          sessionId: sessionId,
          birthProvinceCode: candidateB.birthProvinceCode,
          birthCountry: candidateB.birthCountry,
          userId: null,
          email: candidateB.email,
          resultRecipientEmail: candidateB.resultRecipientEmail,
          organizationLearnerId: candidateB.organizationLearnerId,
          birthPostalCode: candidateB.birthPostalCode,
          birthINSEECode: candidateB.birthINSEECode,
          sex: candidateB.sex,
          authorizedToStart: false,
          billingMode: candidateB.billingMode,
          prepaymentCode: candidateB.prepaymentCode,
          hasSeenCertificationInstructions: false,
          accessibilityAdjustmentNeeded: candidateB.accessibilityAdjustmentNeeded,
          subscription: Frameworks.CORE,
          hasStartedTest: false,
        }),
        domainBuilder.certification.enrolment.buildCandidate({
          id: idCandidateC,
          createdAt: createdAtC,
          firstName: candidateC.firstName,
          reconciledAt: null,
          lastName: candidateC.lastName,
          birthCity: candidateC.birthCity,
          externalId: candidateC.externalId,
          extraTimePercentage: candidateC.extraTimePercentage,
          birthdate: candidateC.birthdate,
          sessionId: sessionId,
          birthProvinceCode: candidateC.birthProvinceCode,
          birthCountry: candidateC.birthCountry,
          userId: null,
          email: candidateC.email,
          resultRecipientEmail: candidateC.resultRecipientEmail,
          organizationLearnerId: candidateC.organizationLearnerId,
          birthPostalCode: candidateC.birthPostalCode,
          birthINSEECode: candidateC.birthINSEECode,
          sex: candidateC.sex,
          authorizedToStart: false,
          billingMode: candidateC.billingMode,
          prepaymentCode: candidateC.prepaymentCode,
          hasSeenCertificationInstructions: false,
          accessibilityAdjustmentNeeded: candidateC.accessibilityAdjustmentNeeded,
          subscription: Frameworks.DROIT,
          hasStartedTest: false,
        }),
      ]);
    });
  });
});
