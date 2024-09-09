import { registerCenterPilotFeatures } from '../../../../../../src/certification/configuration/domain/usecases/register-pilot-features.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Configuration | Unit | UseCase | register-pilot-features', function () {
  let centerPilotFeaturesRepository;

  beforeEach(function () {
    centerPilotFeaturesRepository = {
      getByCenterId: sinon.stub(),
      update: sinon.stub(),
    };
  });

  it('should enable the V3 pilot', async function () {
    // given
    const actualFeatures = domainBuilder.certification.configuration.buildCenterPilotFeatures.v2({ centerId: 12 });
    centerPilotFeaturesRepository.getByCenterId.resolves(actualFeatures);

    const newFeatures = domainBuilder.certification.configuration.buildCenterPilotFeatures.v3({
      centerId: 12,
      isComplementaryAlonePilot: false,
    });
    centerPilotFeaturesRepository.update.resolves();

    // when
    await registerCenterPilotFeatures({ centerId: 12, isV3Pilot: true, centerPilotFeaturesRepository });

    // then
    expect(centerPilotFeaturesRepository.getByCenterId).to.have.been.calledOnceWithExactly({ centerId: 12 });
    expect(centerPilotFeaturesRepository.update).to.have.been.calledOnceWithExactly({
      centerPilotFeatures: newFeatures,
    });
  });

  it('should disable the V3 pilot', async function () {
    // given
    const actualFeatures = domainBuilder.certification.configuration.buildCenterPilotFeatures.v3({
      centerId: 12,
      isComplementaryAlonePilot: false,
    });
    centerPilotFeaturesRepository.getByCenterId.resolves(actualFeatures);

    const newFeatures = domainBuilder.certification.configuration.buildCenterPilotFeatures
      .v3({
        centerId: 12,
        isComplementaryAlonePilot: false,
      })
      .disableV3Pilot();
    centerPilotFeaturesRepository.update.resolves();

    // when
    await registerCenterPilotFeatures({ centerId: 12, isV3Pilot: false, centerPilotFeaturesRepository });

    // then
    expect(centerPilotFeaturesRepository.getByCenterId).to.have.been.calledOnceWithExactly({ centerId: 12 });
    expect(centerPilotFeaturesRepository.update).to.have.been.calledOnceWithExactly({
      centerPilotFeatures: newFeatures,
    });
  });
});
