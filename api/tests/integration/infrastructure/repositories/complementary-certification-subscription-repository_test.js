import { expect, databaseBuilder } from '../../../test-helper';
import complementaryCertificationSubscriptionRepository from '../../../../lib/infrastructure/repositories/complementary-certification-subscription-repository';
import { knex } from '../../../../lib/infrastructure/bookshelf';

describe('Integration | Infrastructure | Repository | complementary-certification-subscription-repository', function () {
  context('#save', function () {
    afterEach(function () {
      return knex('complementary-certification-subscriptions').delete();
    });

    it('should create a complementary certification subscription', async function () {
      // given
      const certificationCandidateId = databaseBuilder.factory.buildCertificationCandidate().id;
      const complementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification().id;
      await databaseBuilder.commit();

      // when
      await complementaryCertificationSubscriptionRepository.save({
        certificationCandidateId,
        complementaryCertificationId,
      });

      // then
      const complementaryCertificationRegistration = await knex
        .select('*')
        .from('complementary-certification-subscriptions')
        .where({ certificationCandidateId, complementaryCertificationId })
        .first();
      expect(complementaryCertificationRegistration).to.not.be.null;
    });
  });
});
