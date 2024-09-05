import * as centersRepository from '../../../../../../src/certification/configuration/infrastructure/repositories/centers-repository.js';
import { CERTIFICATION_CENTER_TYPES } from '../../../../../../src/shared/domain/constants.js';
import { databaseBuilder, expect } from '../../../../../test-helper.js';

describe('Certification | Configuration | Integration | Repository | centers-repository', function () {
  describe('fetchSCOV2Centers', function () {
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
      const results = await centersRepository.fetchSCOV2Centers();

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
        const results = await centersRepository.fetchSCOV2Centers();

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
  });
});
