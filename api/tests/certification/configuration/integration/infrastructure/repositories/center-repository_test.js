import * as centerRepository from '../../../../../../src/certification/configuration/infrastructure/repositories/center-repository.js';
import { CenterTypes } from '../../../../../../src/certification/enrolment/domain/models/CenterTypes.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Configuration | Integration | Repository | center-repository', function () {
  describe('#addToWhitelistByExternalIds', function () {
    it('should set the centers as whitelisted (case insensitive', async function () {
      // given
      const whitelistedExternalId1 = '1234Abc';
      const center1BeforeUpdate = databaseBuilder.factory.buildCertificationCenter({
        type: CenterTypes.SCO,
        externalId: whitelistedExternalId1,
        updatedAt: new Date('2024-09-24'),
      });
      const whitelistedExternalId2 = 'SCOuai';
      const center2BeforeUpdate = databaseBuilder.factory.buildCertificationCenter({
        type: CenterTypes.SCO,
        externalId: whitelistedExternalId2,
        updatedAt: new Date('2024-09-24'),
      });
      const externalIds = [whitelistedExternalId1, whitelistedExternalId2];
      await databaseBuilder.commit();

      // when
      const updatedExternalIds = await centerRepository.addToWhitelistByExternalIds({
        externalIds: ['1234aBc', 'scouaI'],
      });

      // then
      expect(updatedExternalIds).to.deep.equal(externalIds);
      const updatedCenter1 = await knex('certification-centers').where({ id: center1BeforeUpdate.id }).first();
      expect(updatedCenter1.isScoBlockedAccessWhitelist).to.be.true;
      expect(updatedCenter1.updatedAt).to.be.above(center1BeforeUpdate.updatedAt);

      const updatedCenter2 = await knex('certification-centers').where({ id: center2BeforeUpdate.id }).first();
      expect(updatedCenter2.isScoBlockedAccessWhitelist).to.be.true;
      expect(updatedCenter2.updatedAt).to.be.above(center2BeforeUpdate.updatedAt);
    });

    it('should not update unexisting externalIds', async function () {
      // given
      const whitelistedExternalId1 = '1234ABC';
      databaseBuilder.factory.buildCertificationCenter({
        type: CenterTypes.SCO,
        externalId: whitelistedExternalId1,
      });
      const whitelistedExternalId2 = 'SCOUAI';

      const externalIds = [whitelistedExternalId1, whitelistedExternalId2];
      await databaseBuilder.commit();

      // when
      const updatedExternalIds = await centerRepository.addToWhitelistByExternalIds({
        externalIds: externalIds,
      });

      // then
      expect(updatedExternalIds).to.deep.equal([whitelistedExternalId1]);
    });

    describe('when center is not SCO', function () {
      it('should not whitelist this center', async function () {
        // given
        const whitelistedExternalId1 = '1234ABC';
        const nonSCOCenterBeforeUpdate = databaseBuilder.factory.buildCertificationCenter({
          type: CenterTypes.PRO,
          externalId: whitelistedExternalId1,
        });
        await databaseBuilder.commit();

        // when
        await centerRepository.addToWhitelistByExternalIds({ externalIds: [whitelistedExternalId1] });

        // then
        const notScoCenterInDB = await knex('certification-centers').where({ id: nonSCOCenterBeforeUpdate.id }).first();
        expect(notScoCenterInDB.isScoBlockedAccessWhitelist).to.be.false;
      });
    });

    describe('when a center is archived', function () {
      it('should not whitelist this center', async function () {
        // given
        const archivedCenter = databaseBuilder.factory.buildCertificationCenter({
          type: CenterTypes.SCO,
          archivedAt: new Date('2024-09-24'),
        });
        await databaseBuilder.commit();

        // when
        await centerRepository.addToWhitelistByExternalIds({ externalIds: [archivedCenter.externalId] });

        // then
        const archivedCenterInDB = await knex('certification-centers').where({ id: archivedCenter.id }).first();
        expect(archivedCenterInDB.isScoBlockedAccessWhitelist).to.be.false;
      });
    });

    describe('when there are multiple centers with the same external ID in DB', function () {
      it('should set the centers as whitelisted', async function () {
        // given
        const duplicatedExternalId = '1234ABC';
        databaseBuilder.factory.buildCertificationCenter({
          type: CenterTypes.SCO,
          externalId: duplicatedExternalId,
        });
        databaseBuilder.factory.buildCertificationCenter({
          type: CenterTypes.SCO,
          externalId: duplicatedExternalId,
        });
        await databaseBuilder.commit();

        // when
        const updatedExternalIds = await centerRepository.addToWhitelistByExternalIds({
          externalIds: [duplicatedExternalId],
        });

        // then
        expect(updatedExternalIds).to.deep.equal([duplicatedExternalId, duplicatedExternalId]);
      });
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

  describe('#getWhitelist', function () {
    it('should get whitelisted centers', async function () {
      // given
      const whitelistedCenter = databaseBuilder.factory.buildCertificationCenter({
        type: CenterTypes.SCO,
        isScoBlockedAccessWhitelist: true,
        externalId: 'IN_WHITELIST',
        updatedAt: new Date('2024-09-24'),
      });
      databaseBuilder.factory.buildCertificationCenter({
        type: CenterTypes.SCO,
        isScoBlockedAccessWhitelist: false,
        externalId: 'NOT_IN_WHITELIST',
        updatedAt: new Date('2024-09-24'),
      });
      await databaseBuilder.commit();

      // when
      const results = await centerRepository.getWhitelist();

      // then
      expect(results).to.have.lengthOf(1);
      expect(results[0]).to.deepEqualInstance(
        domainBuilder.certification.configuration.buildCenter({
          id: whitelistedCenter.id,
          type: CenterTypes.SCO,
          externalId: 'IN_WHITELIST',
        }),
      );
    });
  });
});
