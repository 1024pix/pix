import _ from 'lodash';

import { CenterTypes } from '../../../../../../src/certification/enrolment/domain/models/CenterTypes.js';
import { CERTIFICATION_FEATURES } from '../../../../../../src/certification/shared/domain/constants.js';
import { CERTIFICATION_CENTER_TYPES } from '../../../../../../src/shared/domain/constants.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Unit | Certification | Enrolment | Domain | Models | Center', function () {
  context('#isComplementaryAlonePilot', function () {
    it('should return false', function () {
      // given
      const center = domainBuilder.certification.enrolment.buildCenter({
        type: CenterTypes.SUP,
        features: [],
      });

      // when / then
      expect(center.isComplementaryAlonePilot).is.false;
    });

    it('should return true when center', function () {
      // given
      const center = domainBuilder.certification.enrolment.buildCenter({
        type: CenterTypes.SUP,
        features: [CERTIFICATION_FEATURES.CAN_REGISTER_FOR_A_COMPLEMENTARY_CERTIFICATION_ALONE.key],
      });

      // when / then
      expect(center.isComplementaryAlonePilot).is.true;
    });
  });

  context('#hasBillingMode', function () {
    it('should return false when center is of type SCO', function () {
      // given
      const center = domainBuilder.certification.enrolment.buildCenter({ type: CenterTypes.SCO });

      // when / then
      expect(center.hasBillingMode).is.false;
    });

    it('should return true when center is not of type SCO', function () {
      // given
      const center = domainBuilder.certification.enrolment.buildCenter({ type: CenterTypes.SUP });

      // when / then
      expect(center.hasBillingMode).is.true;
    });
  });

  context('#get isSco', function () {
    it('should return true when certification center is SCO', function () {
      // given
      const center = domainBuilder.certification.enrolment.buildCenter({
        type: CERTIFICATION_CENTER_TYPES.SCO,
      });

      // when
      const isSco = center.isSco;

      // then
      expect(isSco).to.be.true;
    });

    it('should return true when center is not SCO', function () {
      // given
      let notScoCenters = Object.values(CERTIFICATION_CENTER_TYPES).map((type) => {
        if (type !== CERTIFICATION_CENTER_TYPES.SCO)
          return domainBuilder.certification.enrolment.buildCenter({
            type: type,
          });
        return null;
      });
      notScoCenters = _.compact(notScoCenters);

      // when
      for (const notScoCenter of notScoCenters) {
        const isSco = notScoCenter.isSco;
        expect(
          isSco,
          `Certification center of type ${notScoCenter.certificationCenterType} should return isSco as false`,
        ).to.be.false;
      }
    });
  });

  context('#isHabilitated', function () {
    it('should return false when the center does not have the habilitation for complementary certification', function () {
      // given
      const center = domainBuilder.certification.enrolment.buildCenter({
        habilitations: [
          domainBuilder.certification.enrolment.buildHabilitation({
            complementaryCertificationId: 123,
            key: 'SOME_KEY',
            label: 'some label',
          }),
        ],
      });

      // then
      expect(center.isHabilitated('SOME_OTHER_KEY')).to.be.false;
    });

    it('should return true when the center has the habilitation for complementary certification', function () {
      // given
      const center = domainBuilder.certification.enrolment.buildCenter({
        habilitations: [
          domainBuilder.certification.enrolment.buildHabilitation({
            complementaryCertificationId: 123,
            key: 'SOME_KEY',
            label: 'some label',
          }),
        ],
      });

      // then
      expect(center.isHabilitated('SOME_KEY')).to.be.true;
    });
  });

  context('#get isCoreComplementaryCompatibilityEnabled', function () {
    it('should return true when center is both isV3Pilot and isComplementaryAlonePilot', function () {
      // given
      const center = domainBuilder.certification.enrolment.buildCenter({
        isV3Pilot: true,
        features: [CERTIFICATION_FEATURES.CAN_REGISTER_FOR_A_COMPLEMENTARY_CERTIFICATION_ALONE.key],
      });

      // when
      const isCoreComplementaryCompatibilityEnabled = center.isCoreComplementaryCompatibilityEnabled;

      // then
      expect(isCoreComplementaryCompatibilityEnabled).to.be.true;
    });

    it('should return false when center is isV3Pilot but not isComplementaryAlonePilot', function () {
      // given
      const center = domainBuilder.certification.enrolment.buildCenter({
        isV3Pilot: true,
        features: [],
      });
      // when
      const isCoreComplementaryCompatibilityEnabled = center.isCoreComplementaryCompatibilityEnabled;

      // then
      expect(isCoreComplementaryCompatibilityEnabled).to.be.false;
    });

    it('should return false when center is not isV3Pilot but is isComplementaryAlonePilot', function () {
      // given
      const center = domainBuilder.certification.enrolment.buildCenter({
        isV3Pilot: false,
        features: [CERTIFICATION_FEATURES.CAN_REGISTER_FOR_A_COMPLEMENTARY_CERTIFICATION_ALONE.key],
      });

      // when
      const isCoreComplementaryCompatibilityEnabled = center.isCoreComplementaryCompatibilityEnabled;

      // then
      expect(isCoreComplementaryCompatibilityEnabled).to.be.false;
    });

    it('should return false when center is neither isV3Pilot nor isComplementaryAlonePilot', function () {
      // given
      const center = domainBuilder.certification.enrolment.buildCenter({
        isV3Pilot: false,
        features: [],
      });

      // when
      const isCoreComplementaryCompatibilityEnabled = center.isCoreComplementaryCompatibilityEnabled;

      // then
      expect(isCoreComplementaryCompatibilityEnabled).to.be.false;
    });
  });
});
