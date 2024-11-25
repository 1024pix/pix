import * as centerRepository from '../../../../../../src/certification/configuration/infrastructure/repositories/center-repository.js';
import { CenterTypes } from '../../../../../../src/certification/enrolment/domain/models/CenterTypes.js';
import { databaseBuilder, expect, knex } from '../../../../../test-helper.js';

describe('Certification | Configuration | Integration | Repository | center-repository', function () {
  describe('#addToWhitelistByExternalIds', function () {
    it('should set the centers as whitelisted', async function () {
      // given
      const whitelistedExternalId1 = '1234ABC';
      const center1BeforeUpdate = databaseBuilder.factory.buildCertificationCenter({
        type: CenterTypes.SCO,
        externalId: whitelistedExternalId1,
        isScoBlockedAccessWhitelist: false,
        updatedAt: new Date('2024-09-24'),
      });
      const whitelistedExternalId2 = 'SCOUAI';
      const center2BeforeUpdate = databaseBuilder.factory.buildCertificationCenter({
        type: CenterTypes.SCO,
        externalId: whitelistedExternalId2,
        isScoBlockedAccessWhitelist: false,
        updatedAt: new Date('2024-09-24'),
      });
      await databaseBuilder.commit();

      // when
      await centerRepository.addToWhitelistByExternalIds({
        externalIds: [whitelistedExternalId1, whitelistedExternalId2],
      });

      // then
      const updatedCenter1 = await knex('certification-centers').where({ id: center1BeforeUpdate.id }).first();
      expect(updatedCenter1.isScoBlockedAccessWhitelist).to.be.true;
      expect(updatedCenter1.updatedAt).to.be.above(center1BeforeUpdate.updatedAt);

      const updatedCenter2 = await knex('certification-centers').where({ id: center2BeforeUpdate.id }).first();
      expect(updatedCenter2.isScoBlockedAccessWhitelist).to.be.true;
      expect(updatedCenter2.updatedAt).to.be.above(center2BeforeUpdate.updatedAt);
    });

    it('should not whitelist centers other than SCO', async function () {
      // given
      const whitelistedExternalId1 = '1234ABC';
      const nonSCOCenterBeforeUpdate = databaseBuilder.factory.buildCertificationCenter({
        type: CenterTypes.PRO,
        externalId: whitelistedExternalId1,
        isScoBlockedAccessWhitelist: false,
        updatedAt: new Date('2024-09-24'),
      });
      await databaseBuilder.commit();

      // when
      await centerRepository.addToWhitelistByExternalIds({
        externalIds: [whitelistedExternalId1],
      });

      // then
      const updatedCenter1 = await knex('certification-centers').where({ id: nonSCOCenterBeforeUpdate.id }).first();
      expect(updatedCenter1.isScoBlockedAccessWhitelist).to.be.false;
    });
  });

  describe('#resetWhitelist', function () {
    it('should reset all isScoBlockedAccessWhitelist to false', async function () {
      // given
      const centerBeforeUpdate = databaseBuilder.factory.buildCertificationCenter({
        type: CenterTypes.SCO,
        isScoBlockedAccessWhitelist: true,
        updatedAt: new Date('2024-09-24'),
      });
      await databaseBuilder.commit();

      // when
      await centerRepository.resetWhitelist();

      // then
      const updatedCenter = await knex('certification-centers').where({ id: centerBeforeUpdate.id }).first();
      expect(updatedCenter.isScoBlockedAccessWhitelist).to.be.false;
      expect(updatedCenter.updatedAt).to.be.above(centerBeforeUpdate.updatedAt);
    });

    it('should not reset centers other than SCO', async function () {
      // given
      const centerBeforeUpdate = databaseBuilder.factory.buildCertificationCenter({
        type: CenterTypes.PRO,
        isScoBlockedAccessWhitelist: true,
        updatedAt: new Date('2024-09-24'),
      });
      await databaseBuilder.commit();

      // when
      await centerRepository.resetWhitelist();

      // then
      const updatedCenter = await knex('certification-centers').where({ id: centerBeforeUpdate.id }).first();
      expect(updatedCenter.isScoBlockedAccessWhitelist).to.be.true;
    });
  });
});
