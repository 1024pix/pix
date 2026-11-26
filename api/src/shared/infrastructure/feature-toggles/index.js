import { config as appConfig } from '../../../../config/config.js';
import config from '../../../../config/feature-toggles-config.js';
import { featureTogglesStorage } from '../key-value-storages/index.js';
import { FeatureTogglesClient } from './feature-toggles-client.js';
import { getFeatureTogglesEnvironment } from './feature-toggles-utils.js';

let _instance = null;

/**
 * Get the singleton instance of the feature toggles client.
 * @returns {Promise<FeatureTogglesClient>} The feature toggles client instance.
 */
async function getInstance() {
  if (!_instance) {
    const environment = getFeatureTogglesEnvironment({
      isTestEnv: appConfig.environment === 'test',
      isE2eTests: appConfig.infra.isE2eTests,
      isReviewApp: appConfig.infra.isReviewApp,
    });
    _instance = new FeatureTogglesClient(featureTogglesStorage, environment);

    await _instance.init(config);

    // Force flushing values for E2E
    if (appConfig.infra.isE2eTests) {
      await _instance.resetDefaults();
    }
  }
  return _instance;
}

/**
 * @type {FeatureTogglesClient}
 * Holds the instance of FeatureTogglesClient.
 */
export const featureToggles = await getInstance();
