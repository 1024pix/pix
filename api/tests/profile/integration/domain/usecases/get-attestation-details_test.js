import { ProfileReward } from '../../../../../src/profile/domain/models/ProfileReward.js';
import { usecases } from '../../../../../src/profile/domain/usecases/index.js';
import { databaseBuilder, expect } from '../../../../test-helper.js';

describe('Profile | Integration | Domain | get-attestation-details', function () {
  describe('#getAttestationDataForUsers', function () {
    it('should return profile rewards', async function () {
      const attestation = databaseBuilder.factory.buildAttestation({
        createdAt: new Date('2020-05-18'),
        templateName: 'pirouette-cacahuete-pdf',
        key: 'PIROUETE_CACAHUETE',
      });

      const firstUser = databaseBuilder.factory.buildUser({ firstName: 'pirouette', lastName: 'ciboulette' });

      const profileReward = new ProfileReward(
        databaseBuilder.factory.buildProfileReward({
          rewardId: attestation.id,
          userId: firstUser.id,
          createdAt: new Date('2024-07-07'),
        }),
      );

      await databaseBuilder.commit();

      const results = await usecases.getAttestationDetails({
        profileRewards: [profileReward],
      });

      expect(results).lengthOf(1);
      expect(results[0].obtainedAt).to.deep.equal(new Date('2024-07-07'));
      expect(results[0].type).to.equal(attestation.key);
    });

    it('should return empty user does not have profileReward', async function () {
      //when
      const result = await usecases.getAttestationDetails({
        profileRewards: [],
      });

      //then
      expect(result).lengthOf(0);
    });
  });
});
