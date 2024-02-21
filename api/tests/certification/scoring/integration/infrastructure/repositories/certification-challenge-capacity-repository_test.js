import { knex } from '../../../../../../db/knex-database-connection.js';
import { databaseBuilder, domainBuilder, expect } from '../../../../../test-helper.js';
import { saveBatch } from '../../../../../../src/certification/scoring/infrastructure/repositories/certification-challenge-capacity-repository.js';
import _ from 'lodash';

describe('Integration | Infrastructure | Repository | CertificationChallengeCapacityRepository', function () {
  describe('#saveBatch', function () {
    describe('when there is no certification challenge capacity', function () {
      it('should save the certification challenge capacities', async function () {
        // given
        const certificationChallenge1 = databaseBuilder.factory.buildCertificationChallenge();
        const certificationChallenge2 = databaseBuilder.factory.buildCertificationChallenge();

        const certificationChallengeCapacities = [
          domainBuilder.buildCertificationChallengeCapacity({
            certificationChallengeId: certificationChallenge1.id,
            capacity: 10,
          }),
          domainBuilder.buildCertificationChallengeCapacity({
            certificationChallengeId: certificationChallenge2.id,
            capacity: 20,
          }),
        ];

        await databaseBuilder.commit();

        // when
        await saveBatch(certificationChallengeCapacities);

        // then
        const capacities = await knex('certification-challenge-capacities').select();
        expect(capacities).to.have.lengthOf(2);
        expect(_.omit(capacities[0], 'createdAt')).to.deep.equal({
          certificationChallengeId: certificationChallenge1.id,
          capacity: 10,
        });
        expect(_.omit(capacities[1], 'createdAt')).to.deep.equal({
          certificationChallengeId: certificationChallenge2.id,
          capacity: 20,
        });
      });
    });

    describe('when a certification challenge capacity already exists', function () {
      it('should update the preexisting certification challenge capacity', async function () {
        const certificationChallenge1 = databaseBuilder.factory.buildCertificationChallenge();
        const certificationChallenge2 = databaseBuilder.factory.buildCertificationChallenge();

        databaseBuilder.factory.buildCertificationChallengeCapacity({
          certificationChallengeId: certificationChallenge1.id,
          capacity: 0,
        });

        await databaseBuilder.commit();

        const certificationChallengeCapacities = [
          domainBuilder.buildCertificationChallengeCapacity({
            certificationChallengeId: certificationChallenge1.id,
            capacity: 10,
          }),
          domainBuilder.buildCertificationChallengeCapacity({
            certificationChallengeId: certificationChallenge2.id,
            capacity: 20,
          }),
        ];

        // when
        await saveBatch(certificationChallengeCapacities);

        // then
        const capacities = await knex('certification-challenge-capacities').select();
        expect(capacities).to.have.lengthOf(2);
        expect(_.omit(capacities[0], 'createdAt')).to.deep.equal({
          certificationChallengeId: certificationChallenge1.id,
          capacity: 10,
        });
        expect(_.omit(capacities[1], 'createdAt')).to.deep.equal({
          certificationChallengeId: certificationChallenge2.id,
          capacity: 20,
        });
      });
    });
  });
});
