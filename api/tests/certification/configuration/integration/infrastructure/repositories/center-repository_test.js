import * as centerRepository from '../../../../../../src/certification/configuration/infrastructure/repositories/center-repository.js';
import { config } from '../../../../../../src/shared/config.js';
import { CERTIFICATION_CENTER_TYPES } from '../../../../../../src/shared/domain/constants.js';
import { databaseBuilder, expect } from '../../../../../test-helper.js';

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
      }).id;
      databaseBuilder.factory.buildCertificationCenter({
        isV3Pilot: true,
        type: CERTIFICATION_CENTER_TYPES.SUP,
      }).id;
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
});
