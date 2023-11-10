import { expect, databaseBuilder, knex } from '../../../test-helper.js';
import _ from 'lodash';
import * as targetProfileShareRepository from '../../../../lib/infrastructure/repositories/target-profile-share-repository.js';

describe('Integration | Repository | Target-profile-share', function () {
  describe('#addTargetProfilesToOrganization', function () {
    let organizationId;
    let targetProfileIdA;
    let targetProfileIdB;
    let targetProfileIdC;

    beforeEach(function () {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      targetProfileIdA = databaseBuilder.factory.buildTargetProfile().id;
      targetProfileIdB = databaseBuilder.factory.buildTargetProfile().id;
      targetProfileIdC = databaseBuilder.factory.buildTargetProfile().id;
      return databaseBuilder.commit();
    });

    it('should save all the target profile shares for the organization', async function () {
      // given
      const targetProfileIdList = [targetProfileIdA, targetProfileIdB, targetProfileIdC];

      // when
      await targetProfileShareRepository.addTargetProfilesToOrganization({ organizationId, targetProfileIdList });

      // then
      const targetProfileShares = await knex('target-profile-shares').where({ organizationId });
      expect(targetProfileShares).to.have.lengthOf(3);
      expect(_.map(targetProfileShares, 'targetProfileId')).exactlyContain([
        targetProfileIdA,
        targetProfileIdB,
        targetProfileIdC,
      ]);
    });

    it('should not create another target profile share nor throw an error when it already exists', async function () {
      // given
      databaseBuilder.factory.buildTargetProfileShare({ organizationId, targetProfileId: targetProfileIdA });
      const targetProfileIdList = [targetProfileIdA, targetProfileIdB, targetProfileIdC];

      // when
      await targetProfileShareRepository.addTargetProfilesToOrganization({ organizationId, targetProfileIdList });

      // then
      const targetProfileShares = await knex('target-profile-shares').where({ organizationId });
      expect(targetProfileShares).to.have.lengthOf(3);
      expect(_.map(targetProfileShares, 'targetProfileId')).to.have.members([
        targetProfileIdA,
        targetProfileIdB,
        targetProfileIdC,
      ]);
    });

    it('should not erase old target profil share', async function () {
      // given
      databaseBuilder.factory.buildTargetProfileShare({ organizationId, targetProfileId: targetProfileIdA });
      await databaseBuilder.commit();
      const targetProfileIdList = [targetProfileIdB, targetProfileIdC];

      // when
      await targetProfileShareRepository.addTargetProfilesToOrganization({ organizationId, targetProfileIdList });

      // then
      const targetProfileShares = await knex('target-profile-shares').where({ organizationId });
      expect(targetProfileShares).to.have.lengthOf(3);
      expect(_.map(targetProfileShares, 'targetProfileId')).exactlyContain([
        targetProfileIdA,
        targetProfileIdB,
        targetProfileIdC,
      ]);
    });
  });

  describe('#batchAddTargetProfilesToOrganization', function () {
    let organizationId;
    let targetProfileIdA;
    let targetProfileIdB;
    let targetProfileIdC;

    beforeEach(function () {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      targetProfileIdA = databaseBuilder.factory.buildTargetProfile().id;
      targetProfileIdB = databaseBuilder.factory.buildTargetProfile().id;
      targetProfileIdC = databaseBuilder.factory.buildTargetProfile().id;
      return databaseBuilder.commit();
    });

    it('should add rows in the table "table-profile-shares"', async function () {
      // given
      const organizationsTargetProfiles = [
        { organizationId, targetProfileId: targetProfileIdA },
        { organizationId, targetProfileId: targetProfileIdB },
        { organizationId, targetProfileId: targetProfileIdC },
      ];

      // when
      await targetProfileShareRepository.batchAddTargetProfilesToOrganization(organizationsTargetProfiles);

      // then
      const foundTargetProfileShares = await knex('target-profile-shares').select();
      expect(foundTargetProfileShares.length).to.equal(3);
    });
  });
});
