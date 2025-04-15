import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Unit | Certification | Configuration | Domain | Models | CenterPilotFeatures', function () {
  it('should create a CenterPilotFeatures object', function () {
    // given
    // when
    const result = domainBuilder.certification.configuration.buildCenterPilotFeatures.v2({ centerId: 12 });
    // then
    expect(result).to.deep.equal({
      centerId: 12,
      isComplementaryAlonePilot: false,
    });
  });

  context('enableComplementaryAlonePilot', function () {
    it('should enable the ComplementaryAlone Pilot feature', function () {
      // given
      const features = domainBuilder.certification.configuration.buildCenterPilotFeatures.v3({
        centerId: 12,
        isComplementaryAlonePilot: false,
      });
      // when
      const result = features.enableComplementaryAlonePilot();
      // then
      expect(result.isComplementaryAlonePilot).to.be.true;
    });
  });
});
