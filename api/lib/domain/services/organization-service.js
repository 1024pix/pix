const { sampleSize, random, uniqBy, concat, orderBy } = require('lodash');
const organizationRepository = require('../../infrastructure/repositories/organization-repository');
const targetProfileRepository = require('../../infrastructure/repositories/target-profile-repository');
const userRepository = require('../../infrastructure/repositories/user-repository');
const logger = require('../../infrastructure/logger');

const SNAPSHOT_CSV_PAGE_SIZE = 200;

function _randomLetters(count) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXZ'.split('');
  return sampleSize(letters, count).join('');
}

function _noCodeGivenIn(filters) {
  const code = filters.code;
  return !code || !code.trim();
}

function _extractProfilesSharedWithOrganization(organization) {
  return organization.targetProfileShares.map((targetProfileShare) => {
    return targetProfileShare.targetProfile;
  });
}

function _generateOrganizationCode() {
  let code = _randomLetters(4);
  code += random(0, 9) + '' + random(0, 9);
  return code;
}

module.exports = {

  generateUniqueOrganizationCode({ organizationRepository }) {
    const code = _generateOrganizationCode();
    return organizationRepository.isCodeAvailable(code)
      .then(() => code)
      .catch(() => this.generateUniqueOrganizationCode({ organizationRepository }));
  },

  findAllTargetProfilesAvailableForOrganization(organizationId) {
    return organizationRepository.get(organizationId)
      .then((organization) => {
        return Promise.all([
          targetProfileRepository.findTargetProfilesOwnedByOrganizationId(organizationId),
          _extractProfilesSharedWithOrganization(organization),
          targetProfileRepository.findPublicTargetProfiles(),
        ]);
      })
      .then(([targetProfilesOwnedByOrganization, targetProfileSharesWithOrganization, publicTargetProfiles]) => {
        const orderedPrivateProfile = orderBy(concat(targetProfilesOwnedByOrganization, targetProfileSharesWithOrganization), 'name');
        const orderedPublicProfile = orderBy(publicTargetProfiles, 'name');
        const allAvailableTargetProfiles = concat(orderedPrivateProfile, orderedPublicProfile);
        return uniqBy(allAvailableTargetProfiles, 'id');
      });
  },

  async writeOrganizationSharedProfilesAsCsvToStream(
    { organizationRepository, competenceRepository, snapshotRepository, snapshotsCsvConverter },
    organizationId,
    writableStream) {

    const [organization, competences] = await Promise.all([
      organizationRepository.get(organizationId),
      competenceRepository.list(),
    ]);

    writableStream.write(snapshotsCsvConverter.generateHeader(organization, competences));

    const processPage = async (page) => {
      try {
        const snapshots = await snapshotRepository.find({
          organizationId,
          page,
          pageSize: SNAPSHOT_CSV_PAGE_SIZE
        });

        if (snapshots.length) {
          const jsonSnapshots = snapshots.map((snapshot) => snapshot.toJSON());

          const csvPage = snapshotsCsvConverter.convertJsonToCsv(jsonSnapshots);
          writableStream.write(csvPage);
          processPage(page + 1);
        } else {
          writableStream.end();
        }
      } catch (err) {
        logger.error(err);
        writableStream.emit('error', err);
      }
    };

    // No return/await here, we need the writing to continue in the
    // background after this function's returned promise resolves.
    processPage(1);
  },

  search(userId, filters = {}) {
    return userRepository
      .hasRolePixMaster(userId)
      .then((isUserPixMaster) => {
        if (!isUserPixMaster && _noCodeGivenIn(filters)) {
          return [];
        }
        return organizationRepository.findBy(filters);
      });

  }

};
