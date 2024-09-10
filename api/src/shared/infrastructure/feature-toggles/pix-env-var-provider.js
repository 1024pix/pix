import { StandardResolutionReasons } from '@openfeature/server-sdk';

import { config } from '../../config.js';

export class PixEnvVarProvider {
  metadata = {
    name: 'Pix environment variable feature toggles',
  };

  runsOn = 'server';

  async resolveBooleanEvaluation(flagKey) {
    return {
      value: config.featureToggles[flagKey] ?? false,
      reason: StandardResolutionReasons.STATIC,
    };
  }

  async resolveStringEvaluation(_flagKey) {
    return null;
  }

  async resolveNumberEvaluation(_flagKey) {
    return null;
  }

  async resolveObjectEvaluation(_flagKey) {
    return null;
  }
}
