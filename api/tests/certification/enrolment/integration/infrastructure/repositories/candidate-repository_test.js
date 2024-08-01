import { CertificationCandidateNotFoundError } from '../../../../../../src/certification/enrolment/domain/errors.js';
import { Candidate } from '../../../../../../src/certification/enrolment/domain/models/Candidate.js';
import * as candidateRepository from '../../../../../../src/certification/enrolment/infrastructure/repositories/candidate-repository.js';
import { catchErr, databaseBuilder, domainBuilder, expect } from '../../../../../test-helper.js';

describe('Integration | Certification | Session | Repository | Candidate', function () {
  describe('#get', function () {
    describe('when the candidate exists', function () {
      it('should return the candidate', async function () {
        // when
        const certificationCandidate = databaseBuilder.factory.buildCertificationCandidate();

        await databaseBuilder.commit();

        const result = await candidateRepository.get({ certificationCandidateId: certificationCandidate.id });

        // then
        expect(result).to.deepEqualInstance(
          new Candidate({
            ...certificationCandidate,
          }),
        );
      });
    });

    describe('when the candidate does not exist', function () {
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

  describe('#update', function () {
    describe('when the candidate exists', function () {
      it('should update the candidate', async function () {
        // when
        const certificationCandidate = databaseBuilder.factory.buildCertificationCandidate({
          firstName: 'toto',
        });

        await databaseBuilder.commit();

        const certificationCandidateToUpdate = domainBuilder.certification.enrolment.buildCertificationSessionCandidate(
          {
            ...certificationCandidate,
          },
        );

        certificationCandidateToUpdate.firstName = 'tutu';

        const updatedCertificationCandidate = await candidateRepository.update(certificationCandidateToUpdate);

        // then
        expect(updatedCertificationCandidate).to.be.instanceOf(Candidate);
        expect(updatedCertificationCandidate.firstName).to.equal('tutu');
      });
    });

    describe('when the candidate does not exist', function () {
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

  describe('#isUserCertificationCandidate', function () {
    describe('when the candidate exists and is reconciled to a given user', function () {
      it('should return true', async function () {
        // when
        const userId = databaseBuilder.factory.buildUser().id;
        const certificationCandidate = databaseBuilder.factory.buildCertificationCandidate({
          userId,
        });

        await databaseBuilder.commit();

        const isUserCertificationCandidate = await candidateRepository.isUserCertificationCandidate({
          userId,
          certificationCandidateId: certificationCandidate.id,
        });

        // then
        expect(isUserCertificationCandidate).to.be.true;
      });
    });

    describe('when the candidate is not reconciled to the given user', function () {
      it('should return false', async function () {
        // when
        const userId = databaseBuilder.factory.buildUser().id;
        const certificationCandidate = databaseBuilder.factory.buildCertificationCandidate({
          userId: null,
        });

        await databaseBuilder.commit();

        const isUserCertificationCandidate = await candidateRepository.isUserCertificationCandidate({
          userId,
          certificationCandidateId: certificationCandidate.id,
        });

        // then
        expect(isUserCertificationCandidate).to.be.false;
      });
    });
  });
});
