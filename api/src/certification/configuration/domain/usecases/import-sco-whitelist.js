/**
 * @typedef {import ('../../domain/usecases/index.js').CenterRepository} CenterRepository
 */

/**
 * @param {Object} params
 * @param {CenterRepository} params.centerRepository
 */
export const importScoWhitelist = async ({ externalIds = [], centerRepository }) => {
    return centerRepository.addToWhitelistByExternalIds({externalIds});
};
