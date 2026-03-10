/**
 * @typedef {import ('../models/Frameworks.js')} Frameworks
 * @typedef {import ('./index.js').VersionsRepository} VersionsRepository
 * @typedef {import ('./index.js').TargetProfilesRepository} TargetProfilesRepository
 */

/**
 * @param {object} params
 * @param {Frameworks} params.frameworkKey
 * @param {VersionsRepository} params.versionsRepository
 * @param {TargetProfilesRepository} params.targetProfilesRepository
 *
 * @returns {Promise<{ versions: Array<Version>, targetProfiles: Array<TargetProfile> }>}
 */

export default function getFrameworkVersionsAndTargetProfiles({
  frameworkKey,
  versionsRepository,
  targetProfilesRepository,
}) {}
