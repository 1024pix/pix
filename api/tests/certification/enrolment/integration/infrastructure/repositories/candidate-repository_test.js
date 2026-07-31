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
        const certificationCandidate = domainBuilder.certification.enrolment
          .candidateBuilder()
          .insertToDB({ databaseBuilder });
        await databaseBuilder.commit();

        // when
        const result = await candidateRepository.get({ certificationCandidateId: certificationCandidate.id });

        // then
        expect(result).to.deepEqualInstance(certificationCandidate);
      });
    });

    context('when the candidate has an associated certification course', function () {
      it('should return the candidate with information on whether he/she started the test', async function () {
        // given
        const certificationCandidate = domainBuilder.certification.enrolment
          .candidateBuilder()
          .asReconciled()
          .insertToDB({ databaseBuilder });
        databaseBuilder.factory.buildCertificationCourse({
          userId: certificationCandidate.userId,
          candidateId: certificationCandidate.id,
        });
        // when certificationCourse is linked to CandidateId, hasStartedTest is true
        certificationCandidate.hasStartedTest = true;
        await databaseBuilder.commit();

        // when
        const result = await candidateRepository.get({ certificationCandidateId: certificationCandidate.id });

        // then
        expect(result).to.deepEqualInstance(certificationCandidate);
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

        const certificationCandidate1 = domainBuilder.certification.enrolment
          .candidateBuilder()
          .withSubscription(Frameworks.CLEA)
          .withParameters({ sessionId })
          .insertToDB({ databaseBuilder });

        const certificationCandidate2 = domainBuilder.certification.enrolment
          .candidateBuilder()
          .withParameters({ sessionId })
          .insertToDB({ databaseBuilder });

        domainBuilder.certification.enrolment.candidateBuilder().insertToDB({ databaseBuilder });
        await databaseBuilder.commit();

        // when
        const result = await candidateRepository.findBySessionId({ sessionId });

        // then
        expect(result).to.deepEqualArray([certificationCandidate1, certificationCandidate2]);
      });
    });

    context('when there are no candidate', function () {
      it('returns empty array', async function () {
        // given
        const sessionId = databaseBuilder.factory.buildSession().id;
        const otherSessionId = databaseBuilder.factory.buildSession().id;
        domainBuilder.certification.enrolment
          .candidateBuilder()
          .withParameters({ sessionId })
          .insertToDB({ databaseBuilder });
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
        const userId = databaseBuilder.factory.buildUser().id;
        const candidate1 = domainBuilder.certification.enrolment
          .candidateBuilder()
          .asReconciled({ userId })
          .insertToDB({ databaseBuilder });
        const candidate2 = domainBuilder.certification.enrolment
          .candidateBuilder()
          .asReconciled({ userId })
          .insertToDB({ databaseBuilder });

        domainBuilder.certification.enrolment.candidateBuilder().withParameters().insertToDB({ databaseBuilder });
        await databaseBuilder.commit();

        // when
        const result = await candidateRepository.findByUserId({ userId });

        // then
        expect(result).to.deepEqualArray([candidate1, candidate2]);
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
        const certificationCandidate = domainBuilder.certification.enrolment
          .candidateBuilder()
          .withIdentity({ firstName: 'toto' })
          .insertToDB({ databaseBuilder });

        await databaseBuilder.commit();

        // when
        await candidateRepository.update({ ...certificationCandidate, firstName: 'tutu' });

        const candidate = await candidateRepository.get({
          certificationCandidateId: certificationCandidate.id,
        });

        // then
        expect(candidate).to.be.instanceOf(Candidate);
        expect(candidate.firstName).to.equal('tutu');
      });

      it('should update its subscription', async function () {
        // given
        const certificationCandidate = domainBuilder.certification.enrolment
          .candidateBuilder()
          .withSubscription(Frameworks.DROIT)
          .insertToDB({ databaseBuilder });
        await databaseBuilder.commit();

        // when
        await candidateRepository.update({ ...certificationCandidate, subscription: Frameworks.EDU_1ER_DEGRE });

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
      const sessionId = databaseBuilder.factory.buildSession({}).id;
      await databaseBuilder.commit();
      const candidateA = domainBuilder.certification.enrolment
        .candidateBuilder()
        .withSubscription(Frameworks.CLEA)
        .withIdentity({
          firstName: 'Lolo',
          lastName: 'Lapraline',
        })
        .withParameters({
          accessibilityAdjustmentNeeded: true,
          sessionId,
        })
        .build();
      const candidateB = domainBuilder.certification.enrolment
        .candidateBuilder()
        .withIdentity({
          firstName: 'Geogeo',
          lastName: 'Lenougat',
        })
        .withParameters({
          accessibilityAdjustmentNeeded: true,
          sessionId,
        })
        .build();
      const candidateC = domainBuilder.certification.enrolment
        .candidateBuilder()
        .withIdentity({
          firstName: 'Loulou',
          lastName: 'Lapistache',
        })
        .withSubscription(Frameworks.DROIT)
        .withParameters({
          sessionId,
          accessibilityAdjustmentNeeded: false,
        })
        .build();

      // when
      const savedCandidates = await candidateRepository.save({ candidates: [candidateA, candidateB, candidateC] });

      // then
      const candidatesInSession = await candidateRepository.findBySessionId({ sessionId });
      expect(savedCandidates).to.deepEqualArray(candidatesInSession);
    });
  });
});
