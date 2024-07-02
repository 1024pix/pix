import { main } from '../../../../../scripts/certification/next-gen/import-pilot-certification-centers-from-csv.js';
import { CERTIFICATION_FEATURES } from '../../../../../src/certification/shared/domain/constants.js';
import { catchErr, createTempFile, databaseBuilder, expect, knex, removeTempFile } from '../../../../test-helper.js';

describe('Integration | Scripts | Certification | import-pilot-certification-centers-from-csv', function () {
  let file;

  afterEach(async function () {
    await removeTempFile(file);
  });

  context('when pilot certification center list from a csv file is imported', function () {
    it('should import the pilot certification center list', async function () {
      // given
      const file = 'pilot-certification-centers-valid.csv';
      const data = 'certification_center_id;\n1001;\n1002;\n';
      const csvFilePath = await createTempFile(file, data);

      const certificationCenterId1 = 1001;
      const certificationCenterId2 = 1002;
      const certificationCenterId3 = 1003;

      const featureId = databaseBuilder.factory.buildFeature({
        key: CERTIFICATION_FEATURES.CAN_REGISTER_FOR_A_COMPLEMENTARY_CERTIFICATION_ALONE.key,
      }).id;

      databaseBuilder.factory.buildCertificationCenter({ id: certificationCenterId1, isV3Pilot: true });
      databaseBuilder.factory.buildCertificationCenter({ id: certificationCenterId2, isV3Pilot: true });
      databaseBuilder.factory.buildCertificationCenter({ id: certificationCenterId3, isV3Pilot: true });

      databaseBuilder.factory.buildCertificationCenterFeature({ certificationCenterId1, featureId });

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
        const file = 'pilot-certification-centers-invalid-v3-centers.csv';
        const data = 'certification_center_id;\n2001;\n2002;\n';
        const csvFilePath = await createTempFile(file, data);
        const v2CertificationCenterId = 2001;
        const v3CertificationCenterId = 2002;
        const v2CertificationCenterId2 = 2003;

        const featureId = databaseBuilder.factory.buildFeature({
          key: CERTIFICATION_FEATURES.CAN_REGISTER_FOR_A_COMPLEMENTARY_CERTIFICATION_ALONE.key,
        }).id;

        databaseBuilder.factory.buildCertificationCenter({ id: v2CertificationCenterId, isV3Pilot: true });
        databaseBuilder.factory.buildCertificationCenter({ id: v3CertificationCenterId, isV3Pilot: false });
        databaseBuilder.factory.buildCertificationCenter({ id: v2CertificationCenterId2, isV3Pilot: true });
        databaseBuilder.factory.buildCertificationCenterFeature({ v2CertificationCenterId, featureId });
        await databaseBuilder.commit();

        // when
        const error = await catchErr(main)(csvFilePath);

        // then
        expect(error.message).to.equal('V2 certification centers : 2002 are not allowed as pilots');
      });
    });
  });
});
