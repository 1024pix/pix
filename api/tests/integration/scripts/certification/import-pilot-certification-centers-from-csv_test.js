import path from 'node:path';
import * as url from 'node:url';

import { main } from '../../../../scripts/certification/import-pilot-certification-centers-from-csv.js';
import { CERTIFICATION_FEATURES } from '../../../../src/certification/shared/domain/constants.js';
import { catchErr, databaseBuilder, expect, knex } from '../../../test-helper.js';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

describe('Integration | Scripts | Certification | import-pilot-certification-centers-from-csv', function () {
  context('when pilot certification center list from a csv file is imported', function () {
    it('should import the pilot certification center list', async function () {
      // given
      const csvFilePath = path.join(
        __dirname,
        'files/import-pilot-certification-centers-from-csv/pilot-certification-centers.csv',
      );
      const certificationCenterId1 = 1001;
      const certificationCenterId2 = 1002;
      const certificationCenterId3 = 1003;

      const featureId = databaseBuilder.factory.buildFeature({
        key: CERTIFICATION_FEATURES.CAN_REGISTER_FOR_A_COMPLEMENTARY_CERTIFICATION_ALONE.key,
      }).id;

      databaseBuilder.factory.buildCertificationCenter({ id: certificationCenterId1 });
      databaseBuilder.factory.buildCertificationCenter({ id: certificationCenterId2 });
      databaseBuilder.factory.buildCertificationCenter({ id: certificationCenterId3 });

      databaseBuilder.factory.buildCertificationCenterFeature({ certificationCenterId1, featureId });
      databaseBuilder.factory.buildCertificationCenterFeature({ certificationCenterId2, featureId });

      await databaseBuilder.commit();

      // when
      await main(csvFilePath);

      // then
      const pilotCertificationCenterList = await knex('certification-center-features').select(
        'certificationCenterId',
        'featureId',
      );

      expect(pilotCertificationCenterList).to.deep.equal([
        { certificationCenterId: certificationCenterId1, featureId },
        { certificationCenterId: certificationCenterId2, featureId },
      ]);
    });

    context('when there is a V3 certification center in the csv file', function () {
      it('should not import the certification center list', async function () {
        // given
        const csvFilePath = path.join(
          __dirname,
          'files/import-pilot-certification-centers-from-csv/pilot-certification-centers-with-v3.csv',
        );
        const v2CertificationCenterId = 2001;
        const v3CertificationCenterId = 2002;

        const featureId = databaseBuilder.factory.buildFeature({
          key: CERTIFICATION_FEATURES.CAN_REGISTER_FOR_A_COMPLEMENTARY_CERTIFICATION_ALONE.key,
        }).id;

        databaseBuilder.factory.buildCertificationCenter({ id: v2CertificationCenterId });
        databaseBuilder.factory.buildCertificationCenter({ id: v3CertificationCenterId, isV3Pilot: true });
        databaseBuilder.factory.buildCertificationCenterFeature({ v2CertificationCenterId, featureId });
        await databaseBuilder.commit();

        // when
        const error = await catchErr(main)(csvFilePath);

        // then
        expect(error.message).to.equal('V3 certification centers : 2002 are not allowed as pilots');
      });
    });
  });
});
