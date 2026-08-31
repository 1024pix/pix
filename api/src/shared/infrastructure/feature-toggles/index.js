import config from '../../../../config/feature-toggles-config.js';
import { config as appConfig } from '../../config.js';
import { featureTogglesStorage } from '../key-value-storages/index.js';
import { InMemoryKeyValueStorage } from '../key-value-storages/InMemoryKeyValueStorage.js';
import { FeatureTogglesClient } from './feature-toggles-client.js';

const isTestEnv = process.env.NODE_ENV === 'test';

let _instance = null;

/**
 * Get the singleton instance of the feature toggles client.
 * @returns {Promise<FeatureTogglesClient>} The feature toggles client instance.
 */
async function getInstance() {
  if (!_instance) {
    const environment = getFeatureTogglesEnv();
    const storage = isTestEnv ? new InMemoryKeyValueStorage() : featureTogglesStorage;
    _instance = new FeatureTogglesClient(storage, environment);

    await _instance.init(config);
  }
  return _instance;
}

function getFeatureTogglesEnv() {
  if (isTestEnv) return 'test';
  if (appConfig.infra.isReviewApp) return 'reviewApp';
  return;
}

/**
 * @type {FeatureTogglesClient}
 * Holds the instance of FeatureTogglesClient.
 */
export const featureToggles = await getInstance();
