import * as centerRepository from '../../../../../../src/certification/configuration/infrastructure/repositories/center-repository.js';
import { CenterTypes } from '../../../../../../src/certification/enrolment/domain/models/CenterTypes.js';
import { databaseBuilder, domainBuilder, expect, knex } from '../../../../../test-helper.js';

describe('Certification | Configuration | Integration | Repository | center-repository', function () {
  describe('findSCOV2Centers', function () {
    it('should return SCO v2 centers ids', async function () {
      // given
      const centerId = databaseBuilder.factory.buildCertificationCenter({
        isV3Pilot: false,
        type: CenterTypes.SCO,
      }).id;
      databaseBuilder.factory.buildCertificationCenter({
        isV3Pilot: true,
        type: CenterTypes.SCO,
      });
      databaseBuilder.factory.buildCertificationCenter({
        isV3Pilot: false,
        type: CenterTypes.PRO,
      });
      databaseBuilder.factory.buildCertificationCenter({
        isV3Pilot: true,
        type: CenterTypes.PRO,
      });
      await databaseBuilder.commit();

      // when
      const results = await centerRepository.findSCOV2Centers();

      // then
      expect(results).to.deep.equal([
        domainBuilder.certification.configuration.buildCenter({
          id: centerId,
          type: CenterTypes.SCO,
          externalId: 'EX123',
        }),
      ]);
    });

    it('should return paginated results', async function () {
      // given
      // note: identifiers are inserted in a non ASC order on purpose
      const expectedFirstResult = databaseBuilder.factory.buildCertificationCenter({
        id: 333,
        isV3Pilot: false,
        type: CenterTypes.SCO,
      }).id;
      const cursorId = databaseBuilder.factory.buildCertificationCenter({
        id: 111,
        isV3Pilot: true,
        type: CenterTypes.SCO,
      }).id;
      const expectedThirdResult = databaseBuilder.factory.buildCertificationCenter({
        id: 555,
        isV3Pilot: false,
        type: CenterTypes.SCO,
      }).id;
      const expectedSecondResult = databaseBuilder.factory.buildCertificationCenter({
        id: 444,
        isV3Pilot: false,
        type: CenterTypes.SCO,
      }).id;
      await databaseBuilder.commit();

      // when
      const results = await centerRepository.findSCOV2Centers({ cursorId });

      // then
      expect(results).to.deep.equal([
        domainBuilder.certification.configuration.buildCenter({
          id: expectedFirstResult,
          type: CenterTypes.SCO,
          externalId: 'EX123',
        }),
        domainBuilder.certification.configuration.buildCenter({
          id: expectedSecondResult,
          type: CenterTypes.SCO,
          externalId: 'EX123',
        }),
        domainBuilder.certification.configuration.buildCenter({
          id: expectedThirdResult,
          type: CenterTypes.SCO,
          externalId: 'EX123',
        }),
      ]);
    });

    context('when no remaining centers in V2', function () {
      it('should return an empty array', async function () {
        // given
        databaseBuilder.factory.buildCertificationCenter({ isV3Pilot: true }).id;
        databaseBuilder.factory.buildCertificationCenter({
          isV3Pilot: true,
          type: CenterTypes.SCO,
        });
        await databaseBuilder.commit();

        // when
        const results = await centerRepository.findSCOV2Centers();

        // then
        expect(results).to.deep.equal([]);
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

  describe('#updateCentersToV3', function () {
    it('should set isV3Pilot to true for v2 centers', async function () {
      const v2Center = databaseBuilder.factory.buildCertificationCenter({
        isV3Pilot: false,
      });
      await databaseBuilder.commit();

      const count = await centerRepository.updateCentersToV3({ preservedCenterIds: [] });

      const updatedCenter = await knex('certification-centers').where({ id: v2Center.id }).first();
      expect(updatedCenter.isV3Pilot).to.be.true;
      expect(count).to.equal(1);
    });

    it('should avoid setting isV3Pilot to true for v2 centers of preservedCenterIds', async function () {
      const v2Center = databaseBuilder.factory.buildCertificationCenter({
        isV3Pilot: false,
      });
      const v2CenterToPreserve = databaseBuilder.factory.buildCertificationCenter({
        isV3Pilot: false,
      });
      await databaseBuilder.commit();

      await centerRepository.updateCentersToV3({ preservedCenterIds: [v2CenterToPreserve.id] });

      const updatedCenter = await knex('certification-centers').where({ id: v2Center.id }).first();
      expect(updatedCenter.isV3Pilot).to.be.true;

      const preservedCenter = await knex('certification-centers').where({ id: v2CenterToPreserve.id }).first();
      expect(preservedCenter.isV3Pilot).to.be.false;
    });
  });
});
