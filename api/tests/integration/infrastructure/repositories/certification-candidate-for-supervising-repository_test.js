const { catchErr, databaseBuilder, expect, knex } = require('../../../test-helper');
const certificationCandidateForSupervisingRepository = require('../../../../lib/infrastructure/repositories/certification-candidate-for-supervising-repository');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Integration | Repository | certification candidate for supervising', function () {
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
      it('should throw', async function () {
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
          certificationCandidateForSupervising
        );

        // then
        expect(error).to.be.an.instanceOf(NotFoundError);
      });
    });
  });
});
