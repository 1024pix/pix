import { catchErr, databaseBuilder, expect, knex, domainBuilder } from '../../../../../test-helper.js';
import * as certificationCandidateForSupervisingRepository from '../../../../../../src/certification/supervision/infrastructure/repositories/certification-candidate-for-supervising-repository.js';
import { CertificationCandidateNotFoundError } from '../../../../../../lib/domain/errors.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';

describe('Integration | Repository | certification candidate for supervising', function () {
  describe('#get', function () {
    describe('when certification candidate is found', function () {
      it('should return the certification candidate', async function () {
        // given
        const session = databaseBuilder.factory.buildSession();
        const user = databaseBuilder.factory.buildUser();
        const candidate = databaseBuilder.factory.buildCertificationCandidate({
          lastName: 'Joplin',
          firstName: 'Janis',
          sessionId: session.id,
          userId: user.id,
          authorizedToStart: false,
        });
        const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
          userId: user.id,
          sessionId: session.id,
          createdAt: new Date('2022-10-01T14:00:00Z'),
        });
        databaseBuilder.factory.buildAssessment({
          certificationCourseId: certificationCourse.id,
          state: Assessment.states.STARTED,
        });

        await databaseBuilder.commit();

        // when
        const result = await certificationCandidateForSupervisingRepository.get(candidate.id);

        // then
        expect(result).to.deep.equal(
          domainBuilder.buildCertificationCandidateForSupervising({
            sessionId: session.id,
            userId: candidate.userId,
            authorizedToStart: false,
            birthdate: '2000-01-04',
            extraTimePercentage: '0.30',
            firstName: 'Janis',
            id: candidate.id,
            lastName: 'Joplin',
            assessmentStatus: 'started',
            startDateTime: new Date('2022-10-01T14:00:00Z'),
            stillValidBadgeAcquisitions: undefined,
          }),
        );
      });
    });

    describe('when certification candidate is not found', function () {
      it('should throw a certification candidate not found error', async function () {
        // given
        const session = databaseBuilder.factory.buildSession({ id: 23049 });
        databaseBuilder.factory.buildUser({ id: 1234 });
        databaseBuilder.factory.buildCertificationCandidate({
          sessionId: session.id,
          userId: 1234,
          authorizedToStart: false,
          birthdate: '2000-01-04',
          extraTimePercentage: '0.30',
          firstName: 'first-name',
          id: 456,
          lastName: 'last-name',
        });

        await databaseBuilder.commit();
        const wrongCandidateId = 1298;

        // when
        const error = await catchErr(certificationCandidateForSupervisingRepository.get)(wrongCandidateId);

        // then
        expect(error).to.be.an.instanceOf(CertificationCandidateNotFoundError);
      });
    });
  });

  describe('#update', function () {
    describe('when certification candidate is found', function () {
      it('should update isAuthorisedToStart certification candidate attribute', async function () {
        // given
        const session = databaseBuilder.factory.buildSession();
        databaseBuilder.factory.buildUser({ id: 1234 });
        const certificationCandidate = databaseBuilder.factory.buildCertificationCandidate({
          sessionId: session.id,
          userId: 1234,
          authorizedToStart: false,
          birthdate: '2000-01-04',
          extraTimePercentage: '0.30',
          firstName: 'first-name',
          id: 456,
          lastName: 'last-name',
        });

        await databaseBuilder.commit();

        // when
        const certificationCandidateForSupervising = {
          id: certificationCandidate.id,
          authorizedToStart: true,
        };
        await certificationCandidateForSupervisingRepository.update(certificationCandidateForSupervising);

        // then
        const authorizedToStart = await knex
          .select('authorizedToStart')
          .from('certification-candidates')
          .where({ id: certificationCandidate.id })
          .first();

        expect(authorizedToStart).to.deep.equals({ authorizedToStart: true });
      });
    });

    describe('when certification candidate is not found', function () {
      it('should throw a certification candidate not found error', async function () {
        // given
        const session = databaseBuilder.factory.buildSession({ id: 23049 });
        databaseBuilder.factory.buildUser({ id: 1234 });
        databaseBuilder.factory.buildCertificationCandidate({
          sessionId: session.id,
          userId: 1234,
          authorizedToStart: false,
          birthdate: '2000-01-04',
          extraTimePercentage: '0.30',
          firstName: 'first-name',
          id: 456,
          lastName: 'last-name',
        });

        await databaseBuilder.commit();
        const wrongCandidateId = 1298;

        // when
        const certificationCandidateForSupervising = {
          id: wrongCandidateId,
          authorizedToStart: true,
        };
        const error = await catchErr(certificationCandidateForSupervisingRepository.update)(
          certificationCandidateForSupervising,
        );

        // then
        expect(error).to.be.an.instanceOf(CertificationCandidateNotFoundError);
      });
    });
  });
});
