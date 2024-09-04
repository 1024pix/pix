import { CenterPilotFeatures } from '../../../../../../src/certification/configuration/domain/models/CenterPilotFeatures.js';
import { CertificationCenterPilotFeaturesConflictError } from '../../../../../../src/shared/domain/errors.js';
import { catchErrSync, expect } from '../../../../../test-helper.js';

describe('Unit | Certification | Configuration | Domain | Models | CenterPilotFeatures', function () {
  it('should create a CenterPilotFeatures object', function () {
    // given
    // when
    const result = new CenterPilotFeatures({ centerId: 12 });
    // then
    expect(result).to.deep.equal({
      centerId: 12,
      isComplementaryAlonePilot: false,
      isV3Pilot: false,
    });
  });

  context('enableComplementaryAlonePilot', function () {
    it('should return an error if not already isV3Pilot', function () {
      // given
      const features = new CenterPilotFeatures({ centerId: 12 });
      // when
      const error = catchErrSync(() => features.enableComplementaryAlonePilot())();
      // then
      expect(error).to.be.instanceOf(CertificationCenterPilotFeaturesConflictError);
    });

    it('should enable the ComplementaryAlone Pilot feature', function () {
      // given
      const features = new CenterPilotFeatures({ centerId: 12 }).enableV3Pilot();
      // when
      const result = features.enableComplementaryAlonePilot();
      // then
      expect(result.isComplementaryAlonePilot).to.be.true;
    });
  });

  context('enableV3Pilot', function () {
    it('should enable the V3 Pilot feature', function () {
      // given
      const features = new CenterPilotFeatures({ centerId: 12 });
      // when
      const result = features.enableV3Pilot();
      // then
      expect(result.isV3Pilot).to.be.true;
    });
  });

  context('disableV3Pilot', function () {
    it('should return an error if isComplementaryAlonePilot is true', function () {
      // given
      const features = new CenterPilotFeatures({ centerId: 12 }).enableV3Pilot().enableComplementaryAlonePilot();
      // when
      const error = catchErrSync(() => features.disableV3Pilot())();
      // then
      expect(error).to.be.instanceOf(CertificationCenterPilotFeaturesConflictError);
    });

    it('should enable the ComplementaryAlone Pilot feature', function () {
      // given
      const features = new CenterPilotFeatures({ centerId: 12 }).enableV3Pilot();
      // when
      const result = features.disableV3Pilot();
      // then
      expect(result.isV3Pilot).to.be.false;
    });
  });
});
