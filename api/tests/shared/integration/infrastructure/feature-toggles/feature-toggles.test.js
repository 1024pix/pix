import { featureToggles } from '../../../../../src/shared/infrastructure/feature-toggles/index.js';

describe('Integration | Infrastructure | Feature Toggles | Feature Toggles', function () {
  it('changes the toggle value in tests', async function () {
    // given / when
    await featureToggles.set('dynamicFeatureToggleSystem', true);

    // then
    const dynamicFeatureToggleSystem = await featureToggles.get('dynamicFeatureToggleSystem');
    expect(dynamicFeatureToggleSystem).to.equal(true);
  });

  it('returns the default value in tests', async function () {
    // given / when
    const dynamicFeatureToggleSystem = await featureToggles.get('dynamicFeatureToggleSystem');

    // then
    expect(dynamicFeatureToggleSystem).to.equal(false);
  });
});
