import flatten from 'lodash/flatten.js';
import pickBy from 'lodash/pickBy.js';

export class ClaimManager {
  #claimMapping;
  #additionalClaims;

  /**
   * @param {Object} options
   * @param {Record<string, string[]>} options.claimMapping
   * @param {string[]} options.additionalClaims
   */
  constructor({ claimMapping, additionalClaims } = {}) {
    this.#claimMapping = claimMapping || {};
    this.#additionalClaims = additionalClaims || [];
  }

  /**
   * @returns boolean
   */
  get hasAdditionalClaims() {
    return this.#additionalClaims.length > 0;
  }

  /**
   * @param {Record<string, string>} userInfo
   *
   * @returns {Record<string, string>} Mapped claims from userInfo
   */
  mapClaims(userInfo = {}) {
    return Object.entries(this.#claimMapping).reduce((result, [userKey, claimKeys]) => {
      for (const claimKey of claimKeys) {
        if (userInfo[claimKey]) {
          return { ...result, [userKey]: userInfo[claimKey] };
        }
      }
      return result;
    }, {});
  }

  /**
   * @param {Record<string, string>} userInfo
   *
   * @returns {Record<string, string>} Additional claims from userInfo
   */
  pickAdditionalClaims(userInfo = {}) {
    return pickBy(userInfo, (value, key) => Boolean(value) && this.#additionalClaims.includes(key));
  }

  /**
   * @param {Record<string, string>} userInfo
   *
   * @returns {boolean} true if required claims are missing from userInfo
   */
  hasMissingClaims(userInfo = {}) {
    const missingClaims = this.getMissingClaims(userInfo);
    return missingClaims.length > 0;
  }

  /**
   * @param {Record<string, string>} userInfo
   *
   * @returns {string[]} missing required claims from userInfo
   */
  getMissingClaims(userInfo = {}) {
    return [...this.#getMissingClaimsToMap(userInfo), ...this.#getMissingAdditionalClaims(userInfo)];
  }

  #getMissingClaimsToMap(userInfo = {}) {
    const requiredKeys = Object.keys(this.#claimMapping);
    const mappedKeys = Object.keys(this.mapClaims(userInfo));
    return flatten(
      requiredKeys.filter((required) => !mappedKeys.includes(required)).map((key) => this.#claimMapping[key]),
    );
  }

  #getMissingAdditionalClaims(userInfo = {}) {
    const requiredKeys = this.#additionalClaims;
    const mappedKeys = Object.keys(this.pickAdditionalClaims(userInfo));
    return requiredKeys.filter((required) => !mappedKeys.includes(required));
  }
}
