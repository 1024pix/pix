import { Frameworks } from '../../../shared/domain/models/Frameworks.js';

/**
 * @param {object} params
 * @param {VersionRepository} params.versionRepository
 * @returns {Promise<Array<{id: string, name: string, versionStartDate: Date|null}>>}
 */
const findCertificationFrameworks = async function ({ versionRepository }) {
  const frameworksWithVersions = [];
  for (const framework of Object.values(Frameworks)) {
    if (framework === Frameworks.CLEA) {
      frameworksWithVersions.push({
        id: framework,
        name: framework,
        activeVersionStartDate: null,
      });
      continue;
    }

    const versions = await versionRepository.findAllByScope({ scope: framework });
    const activeVersion = versions.find((version) => version.isActive);

    frameworksWithVersions.push({
      id: framework,
      name: framework,
      activeVersionStartDate: activeVersion?.startDate ?? null,
    });
  }

  return frameworksWithVersions;
};

export { findCertificationFrameworks };
