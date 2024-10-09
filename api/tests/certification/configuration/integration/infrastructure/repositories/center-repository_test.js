import * as centerRepository from '../../../../../../src/certification/configuration/infrastructure/repositories/center-repository.js';
import { CenterTypes } from '../../../../../../src/certification/enrolment/domain/models/CenterTypes.js';
import { config } from '../../../../../../src/shared/config.js';
import { databaseBuilder, domainBuilder, expect, knex } from '../../../../../test-helper.js';

describe('Certification | Configuration | Integration | Repository | center-repository', function () {
  describe('findSCOV2Centers', function () {
    let originalEnvValueWhitelist;

    beforeEach(function () {
      originalEnvValueWhitelist = config.features.pixCertifScoBlockedAccessWhitelist;
      config.features.pixCertifScoBlockedAccessWhitelist = [];
    });

    afterEach(function () {
      config.features.pixCertifScoBlockedAccessWhitelist = originalEnvValueWhitelist;
    });

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

    context('when center is in whitelist', function () {
      it('should filter out center from whitelist', async function () {
        // given
        const externalIdWhitelisted = 'UAI123';
        const notInWhitelistId = databaseBuilder.factory.buildCertificationCenter({
          isV3Pilot: false,
          type: CenterTypes.SCO,
        }).id;
        databaseBuilder.factory.buildCertificationCenter({
          isV3Pilot: false,
          type: CenterTypes.SCO,
          externalId: externalIdWhitelisted,
        }).id;
        await databaseBuilder.commit();

        config.features.pixCertifScoBlockedAccessWhitelist = [externalIdWhitelisted];

        // when
        const results = await centerRepository.findSCOV2Centers();

        // then
        expect(results).to.deep.equal([
          domainBuilder.certification.configuration.buildCenter({
            id: notInWhitelistId,
            type: CenterTypes.SCO,
            externalId: 'EX123',
          }),
        ]);
      });

      it('should not be case sensitive on externalId', async function () {
        // given
        const externalIdOfCenter = 'uAi123';
        // Note : @see config.js : config is already trimmed and uppercased
        const externalIdInConfig = 'UAI123';
        const notInWhitelistId = databaseBuilder.factory.buildCertificationCenter({
          isV3Pilot: false,
          type: CenterTypes.SCO,
        }).id;
        databaseBuilder.factory.buildCertificationCenter({
          isV3Pilot: false,
          type: CenterTypes.SCO,
          externalId: externalIdOfCenter,
        }).id;
        await databaseBuilder.commit();

        config.features.pixCertifScoBlockedAccessWhitelist = [externalIdInConfig];

        // when
        const results = await centerRepository.findSCOV2Centers();

        // then
        expect(results).to.deep.equal([
          domainBuilder.certification.configuration.buildCenter({
            id: notInWhitelistId,
            type: CenterTypes.SCO,
            externalId: 'EX123',
          }),
        ]);
      });
    });

    context('when center has no externalId', function () {
      it('should return the center', async function () {
        // given
        const expectedOne = databaseBuilder.factory.buildCertificationCenter({
          isV3Pilot: false,
          type: CenterTypes.SCO,
          externalId: null,
        }).id;
        const expectedTwo = databaseBuilder.factory.buildCertificationCenter({
          isV3Pilot: false,
          type: CenterTypes.SCO,
          externalId: '',
        }).id;
        const expectedThree = databaseBuilder.factory.buildCertificationCenter({
          isV3Pilot: false,
          type: CenterTypes.SCO,
          externalId: '  ',
        }).id;
        await databaseBuilder.commit();

        // when
        const results = await centerRepository.findSCOV2Centers();

        // then
        expect(results).to.deep.equal([
          domainBuilder.certification.configuration.buildCenter({
            id: expectedOne,
            type: CenterTypes.SCO,
            externalId: null,
          }),
          domainBuilder.certification.configuration.buildCenter({
            id: expectedTwo,
            type: CenterTypes.SCO,
            externalId: '',
          }),
          domainBuilder.certification.configuration.buildCenter({
            id: expectedThree,
            type: CenterTypes.SCO,
            externalId: '  ',
          }),
        ]);
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
