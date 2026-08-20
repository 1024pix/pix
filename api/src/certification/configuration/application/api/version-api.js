import { toScope } from '../../../shared/domain/models/Frameworks.js';
import * as versionRepository from '../../infrastructure/repositories/version-repository.js';
import { Version } from './models/Version.js';

/**
 * @param {object} params
 * @param {Frameworks} params.framework
 * @param {Date} params.date
 * @returns {Promise<Version|null>}
 */
export async function getByFrameworkAndDate({ framework, date }) {
  const scope = toScope(framework);

  const versions = await versionRepository.findAll();
  const foundVersion = versions.find((version) => {
    if (version.scope !== scope) return false;

    const isAfterStart = version.startDate <= date;
    const isBeforeExpiration = !version.expirationDate || version.expirationDate > date;

    return isAfterStart && isBeforeExpiration;
  });

  return foundVersion ? new Version(foundVersion) : null;
}

/**
 * @param {object} params
 * @param {number} params.id
 * @returns {Promise<Version|null>}
 */
export async function getById({ id }) {
  const foundVersion = await versionRepository.getById({ id });
  if (!foundVersion) return null;
  return new Version(foundVersion);
}
