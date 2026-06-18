import Joi from 'joi';

import { getTopic } from '../pubsub.js';
import { child } from '../utils/logger.js';

const logger = child('feature-toggles', { event: 'feature-toggles' });

const ConfigSchema = Joi.object().pattern(
  Joi.string(),
  Joi.object({
    description: Joi.string().required(),
    type: Joi.string().valid('boolean', 'number', 'string', 'array').required(),
    defaultValue: Joi.any().required(),
    devDefaultValues: Joi.object({
      test: Joi.any().optional(),
      reviewApp: Joi.any().optional(),
    }).optional(),
    tags: Joi.array().items(Joi.string()),
  }),
);

class FeatureToggleNotFoundError extends Error {
  constructor(key) {
    super(`Feature toggle with key "${key}" not found in the configuration`);
    this.name = 'FeatureToggleNotFoundError';
  }
}

/**
 * Class representing a feature toggles client.
 */
export class FeatureTogglesClient {
  #topic;
  /** @type {Record<string, any>} */
  #currentValues;
  #eventTarget;

  /**
   * Create a feature toggles client.
   * @param {KeyValueStorage} storage - A KeyValueStorage instance.
   * @param {'test' | 'reviewApp'} [environment] - environment (test or reviewApp)
   * @param {import('../pubsub.js').Topic} topic - PubSub topic object
   */
  constructor(storage, environment, topic = getTopic('feature-toggles')) {
    this.storage = storage;
    this.environment = environment;
    this.#topic = topic;
    this.config = {};
    this.#eventTarget = new EventTarget();
  }

  /**
   * Initialize client and storage with the given configuration
   * @param {Object} config - The configuration.
   * @returns {Promise<void>} A resolved promise
   */
  async init(config) {
    Joi.assert(config, ConfigSchema);
    this.config = config;

    const currentStoredKeys = await this.storage.keys('*');
    for (const key of currentStoredKeys) {
      if (!this.config[key]) {
        await this.storage.delete(key);
      }
    }

    for (const [key, featureToggle] of Object.entries(this.config)) {
      if (!currentStoredKeys.includes(key)) {
        const defaultValue = this.#getFeatureToggleDefaultValue(featureToggle);
        await this.storage.save({ key, value: defaultValue });
      }
    }

    await this.storage.save({ key: '_config', value: this.config });

    this.#topic.subscribe(async (message) => this.#onMessage(message));

    this.#currentValues = await this.all();
  }

  /**
   * Get the value of a feature toggle.
   * @param {string} key - The key of the feature toggle.
   * @returns {Promise<any>} The value of the feature toggle.
   */
  async get(key) {
    const featureToggle = this.config[key];
    if (!featureToggle) {
      throw new FeatureToggleNotFoundError(key);
    }
    const value = await this.storage.get(key);
    return value ?? featureToggle.defaultValue;
  }

  /**
   * Set the value of a feature toggle.
   * @param {string} key - The key of the feature toggle.
   * @param {any} value - The value to set.
   */
  async set(key, value) {
    const featureToggle = this.config[key];
    if (!featureToggle) {
      throw new FeatureToggleNotFoundError(key);
    }

    await this.storage.save({ key, value });

    this.#topic.publish({
      type: 'set',
      key,
    });
  }

  /**
   * Use a feature toggle reference.
   *
   * A feature toggle reference allows synchronously reading the current value,
   * and watching the value changes.
   *
   * @param {string} key - The key of the feature toggle.
   * @returns {FeatureToggleRef} A reference to the feature toggle’s value
   */
  use(key) {
    const featureToggle = this.config[key];
    if (!featureToggle) {
      throw new FeatureToggleNotFoundError(key);
    }

    return new FeatureToggleRef(key, this.#currentValues, this.#eventTarget);
  }

  /**
   * Get all feature toggles.
   * @returns {Promise<Record<string, any>>} An object containing all feature toggles.
   */
  async all() {
    const values = {};
    for (const [key, featureToggle] of Object.entries(this.config)) {
      const value = await this.storage.get(key);
      values[key] = value ?? featureToggle.defaultValue;
    }
    return values;
  }

  /**
   * Get feature toggles with a specific tag.
   * @param {string} tag - The tag to filter feature toggles.
   * @returns {Promise<Record<string, any>>} An object containing the filtered feature toggles.
   */
  async withTag(tag) {
    const configWithTagEntries = Object.entries(this.config).filter(([, config]) => config.tags?.includes(tag));
    const values = {};
    for (const [key, featureToggle] of configWithTagEntries) {
      const value = await this.storage.get(key);
      values[key] = value ?? featureToggle.defaultValue;
    }
    return values;
  }

  /**
   * Reset all feature toggles to their default values.
   */
  async resetDefaults() {
    for (const [key, featureToggle] of Object.entries(this.config)) {
      const defaultValue = this.#getFeatureToggleDefaultValue(featureToggle);
      await this.storage.save({ key, value: defaultValue });
    }

    this.#topic.publish({ type: 'resetDefaults' });
  }

  #getFeatureToggleDefaultValue(featureToggle) {
    if (this.environment === 'test' && featureToggle.devDefaultValues?.test !== undefined) {
      return featureToggle.devDefaultValues.test;
    }

    if (this.environment === 'reviewApp' && featureToggle.devDefaultValues?.reviewApp !== undefined) {
      return featureToggle.devDefaultValues.reviewApp;
    }

    return featureToggle.defaultValue;
  }

  /**
   * @param {{
   *   type: 'set'
   *   key: string
   * }} message
   */
  async #onMessage(message) {
    switch (message.type) {
      case 'set': {
        const oldValue = this.#currentValues[message.key];
        const newValue = await this.get(message.key);

        // skip updating/notifying on strict equality,
        // array/object types will update/notify
        // even if internal values don't change
        if (newValue === oldValue) return;

        this.#currentValues[message.key] = newValue;

        this.#eventTarget.dispatchEvent(new FeatureTogglesEvent('set', message.key, newValue, oldValue));

        break;
      }

      case 'resetDefaults': {
        for (const [key, newValue] of Object.entries(await this.all())) {
          const oldValue = this.#currentValues[key];

          // skip updating/notifying on strict equality,
          // array/object types will update/notify
          // even if internal values don't change
          if (newValue === oldValue) continue;

          this.#currentValues[key] = newValue;

          this.#eventTarget.dispatchEvent(new FeatureTogglesEvent('set', key, newValue, oldValue));

          break;
        }
      }
    }
  }
}

/**
 * Reference to a feature toggle.
 *
 * Use {@link FeatureTogglesClient#use} to create a new reference.
 */
export class FeatureToggleRef {
  #key;
  #currentValues;
  #eventTarget;

  /**
   * @param {string} key
   * @param {Record<string, any>} currentValues
   * @param {EventTarget} eventTarget
   */
  constructor(key, currentValues, eventTarget) {
    this.#key = key;
    this.#currentValues = currentValues;
    this.#eventTarget = eventTarget;
  }

  /**
   * Current value of the feature toggle.
   */
  get value() {
    return this.#currentValues[this.#key];
  }

  /**
   * Watch the feature toggle value changes.
   *
   * @typedef {() => void} UnwatchFeatureToggleFn
   * @typedef {(value: any, oldValue: any) => any | Promise<any>} WatchFeatureToggleCallback
   *
   * @param {WatchFeatureToggleCallback} callback Callback function receiving the value changes.
   * @returns {UnwatchFeatureToggleFn} Unwatch function.
   */
  watch(callback) {
    /**
     * @param {FeatureTogglesEvent} event
     */
    const listener = async (event) => {
      if (event.detail.key !== this.#key) return;
      try {
        await callback(event.detail.value, event.detail.oldValue);
      } catch (err) {
        logger.error({ err, featureToggleKey: this.#key }, 'error in feature toggle watcher');
      }
    };
    this.#eventTarget.addEventListener('set', listener);
    return () => {
      this.#eventTarget.removeEventListener('set', listener);
    };
  }
}

/**
 * @typedef {{
 *   key: string
 *   value: any
 *   oldValue: any
 * }} FeatureToggleEventDetail
 *
 * @extends {CustomEvent<FeatureToggleEventDetail>}
 */
class FeatureTogglesEvent extends CustomEvent {
  /**
   *
   * @param {string} type
   * @param {string} key
   * @param {any} value
   * @param {any} oldValue
   */
  constructor(type, key, value, oldValue) {
    super(type, {
      detail: {
        key,
        value,
        oldValue,
      },
    });
  }
}
