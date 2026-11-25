import { featureToggles } from '../../../src/shared/infrastructure/feature-toggles/index.js';
import { waitFor } from './wait.js';

export async function useFeatureToggle(name, value) {
  await featureToggles.set(name, value);
  await waitFor(() => {
    const result = featureToggles.use(name);
    return result.value === value;
  });
}
