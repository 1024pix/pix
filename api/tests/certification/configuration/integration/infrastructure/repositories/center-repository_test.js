import * as centerRepository from '../../../../../../src/certification/configuration/infrastructure/repositories/center-repository.js';
import { CenterTypes } from '../../../../../../src/certification/enrolment/domain/models/CenterTypes.js';
import { config } from '../../../../../../src/shared/config.js';
import { CERTIFICATION_CENTER_TYPES } from '../../../../../../src/shared/domain/constants.js';
import { databaseBuilder, expect, knex } from '../../../../../test-helper.js';

describe('Certification | Configuration | Integration | Repository | center-repository', function () {
  describe('findSCOV2Centers', function () {
    let originalEnvValueWhitelist;

    beforeEach(function () {
      originalEnvValueWhitelist = config.features.pixCertifScoBlockedAccessWhitelist;
    });

    afterEach(function () {
      config.features.pixCertifScoBlockedAccessWhitelist = originalEnvValueWhitelist;
    });

    it('should return SCO v2 centers ids', async function () {
      // given
      const centerId = databaseBuilder.factory.buildCertificationCenter({
        isV3Pilot: false,
        type: CERTIFICATION_CENTER_TYPES.SCO,
      }).id;
      databaseBuilder.factory.buildCertificationCenter({
        isV3Pilot: true,
        type: CERTIFICATION_CENTER_TYPES.SCO,
      });
      databaseBuilder.factory.buildCertificationCenter({
        isV3Pilot: false,
        type: CERTIFICATION_CENTER_TYPES.PRO,
      });
      databaseBuilder.factory.buildCertificationCenter({
        isV3Pilot: true,
        type: CERTIFICATION_CENTER_TYPES.SUP,
      });
      await databaseBuilder.commit();

      // when
      const results = await centerRepository.findSCOV2Centers();

      // then
      expect(results).to.deep.equal({
        centerIds: [centerId],
        pagination: {
          page: 1,
          pageCount: 1,
          pageSize: 10,
          rowCount: 1,
        },
      });
    });

    context('when no remaining centers in V2', function () {
      it('should return an empty array', async function () {
        // given
        databaseBuilder.factory.buildCertificationCenter({ isV3Pilot: true }).id;
        databaseBuilder.factory.buildCertificationCenter({
          isV3Pilot: true,
          type: CERTIFICATION_CENTER_TYPES.PRO,
        });
        await databaseBuilder.commit();

        // when
        const results = await centerRepository.findSCOV2Centers();

        // then
        expect(results).to.deep.equal({
          centerIds: [],
          pagination: {
            page: 1,
            pageCount: 0,
            pageSize: 10,
            rowCount: 0,
          },
        });
      });
    });

    context('when center is in whitelist', function () {
      it('should filter out center from whitelist', async function () {
        // given
        const externalIdWhitelisted = 'UAI123';
        const notInWhitelistId = databaseBuilder.factory.buildCertificationCenter({
          isV3Pilot: false,
          type: CERTIFICATION_CENTER_TYPES.SCO,
        }).id;
        databaseBuilder.factory.buildCertificationCenter({
          isV3Pilot: false,
          type: CERTIFICATION_CENTER_TYPES.SCO,
          externalId: externalIdWhitelisted,
        }).id;
        await databaseBuilder.commit();

        config.features.pixCertifScoBlockedAccessWhitelist = [externalIdWhitelisted];

        // when
        const results = await centerRepository.findSCOV2Centers();

        // then
        expect(results).to.deep.equal({
          centerIds: [notInWhitelistId],
          pagination: {
            page: 1,
            pageCount: 1,
            pageSize: 10,
            rowCount: 1,
          },
        });
      });
    });
  });

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
