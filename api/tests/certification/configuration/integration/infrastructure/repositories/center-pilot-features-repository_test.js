import * as centerPilotFeaturesRepository from '../../../../../../src/certification/configuration/infrastructure/repositories/center-pilot-features-repository.js';
import { CERTIFICATION_FEATURES } from '../../../../../../src/certification/shared/domain/constants.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, databaseBuilder, domainBuilder, expect, knex } from '../../../../../test-helper.js';

describe('Certification | Configuration | Integration | Repository | center-pilot-features', function () {
  describe('getByCenterId', function () {
    it('should return center features', async function () {
      // given
      const centerId = databaseBuilder.factory.buildCertificationCenter({ isV3Pilot: true }).id;
      const complementaryAlonePilotFeatureId = databaseBuilder.factory.buildFeature(
        CERTIFICATION_FEATURES.CAN_REGISTER_FOR_A_COMPLEMENTARY_CERTIFICATION_ALONE,
      ).id;
      databaseBuilder.factory.buildCertificationCenterFeature({
        certificationCenterId: centerId,
        featureId: complementaryAlonePilotFeatureId,
      });
      await databaseBuilder.commit();

      // when
      const result = await centerPilotFeaturesRepository.getByCenterId({ centerId });

      // then
      const expectedResult = domainBuilder.certification.configuration.buildCenterPilotFeatures.v3({ centerId });
      expect(result).to.deepEqualInstance(expectedResult);
    });

    context('when the certification center could not be found', function () {
      it('should throw a NotFound error', async function () {
        // when
        const unknownCenterId = 1;
        const error = await catchErr(centerPilotFeaturesRepository.getByCenterId)({ centerId: unknownCenterId });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.equal('Center not found');
      });
    });
  });

  describe('update', function () {
    it('should update the center pilot features', async function () {
      // given
      const centerData = databaseBuilder.factory.buildCertificationCenter({
        isV3Pilot: false,
        updatedAt: new Date('2020-01-01'),
      });
      await databaseBuilder.commit();

      // when
      const centerPilotFeatures = domainBuilder.certification.configuration.buildCenterPilotFeatures.v3({
        centerId: centerData.id,
        isComplementaryAlonePilot: false,
      });
      await centerPilotFeaturesRepository.update({ centerPilotFeatures });

      // then
      const update = await knex('certification-centers')
        .select('isV3Pilot', 'updatedAt')
        .where({ id: centerData.id })
        .first();
      expect(update.isV3Pilot).to.be.true;
      expect(update.updatedAt).to.be.above(centerData.updatedAt);
    });
  });
});
