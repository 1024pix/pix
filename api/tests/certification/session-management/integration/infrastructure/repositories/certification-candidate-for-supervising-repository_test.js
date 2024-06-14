import { CertificationCandidateNotFoundError } from '../../../../../../lib/domain/errors.js';
import * as certificationCandidateForSupervisingRepository from '../../../../../../src/certification/session-management/infrastructure/repositories/certification-candidate-for-supervising-repository.js';
import { catchErr, databaseBuilder, expect, knex } from '../../../../../test-helper.js';

describe('Integration | Repository | certification candidate for supervising', function () {
  describe('#authorizeToStart', function () {
    describe('when certification candidate is found', function () {
      it('should update isAuthorizedToStart certification candidate attribute', async function () {
        // given
        const authorizedToStart = true;
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
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: certificationCandidate.id });

        await databaseBuilder.commit();

        // when
        await certificationCandidateForSupervisingRepository.authorizeToStart({
          certificationCandidateId: certificationCandidate.id,
          authorizedToStart,
        });

        // then
        const isAuthorizedToStart = await knex
          .select('authorizedToStart')
          .from('certification-candidates')
          .where({ id: certificationCandidate.id })
          .first();

        expect(isAuthorizedToStart).to.deep.equals({ authorizedToStart: true });
      });
    });

    describe('when certification candidate is not found', function () {
      it('should throw a certification candidate not found error', async function () {
        // given
        const session = databaseBuilder.factory.buildSession({ id: 23049 });
        databaseBuilder.factory.buildUser({ id: 1234 });
        const candidate = databaseBuilder.factory.buildCertificationCandidate({
          sessionId: session.id,
          userId: 1234,
          authorizedToStart: false,
          birthdate: '2000-01-04',
          extraTimePercentage: '0.30',
          firstName: 'first-name',
          id: 456,
          lastName: 'last-name',
        });
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidate.id });

        await databaseBuilder.commit();
        const wrongCandidateId = 1298;

        // when
        const error = await catchErr(certificationCandidateForSupervisingRepository.authorizeToStart)({
          certificationCandidateId: wrongCandidateId,
          authorizedToStart: false,
        });

        // then
        expect(error).to.be.an.instanceOf(CertificationCandidateNotFoundError);
      });
    });
  });
});
