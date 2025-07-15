import { NotFoundError } from '../../../shared/domain/errors.js';
import { httpAgent } from '../../../shared/infrastructure/http-agent.js';
import {
  findOperativeBySkills_dtoonly,
  findValidatedByCompetenceId_dtoonly,
  get_dtoonly,
} from '../../../shared/infrastructure/repositories/challenge-repository.js';
import { ChallengeApiDto } from './models/ChallengeApiDto.js';
import { WebComponentInfoApiDto } from './models/WebComponentInfoApiDto.js';

/**
 * @typedef ChallengeApiDto
 * @type {object}
 * @property {string} id
 * @property {string} instruction
 * @property {string} alternativeInstruction
 * @property {string} proposals
 * @property {string} type
 * @property {string} solution
 * @property {string} solutionToDisplay
 * @property {boolean} t1Status
 * @property {boolean} t2Status
 * @property {boolean} t3Status
 * @property {string} status
 * @property {string} skillId
 * @property {number} timer
 * @property {string} competenceId
 * @property {string} embedUrl
 * @property {string} embedTitle
 * @property {number} embedHeight
 * @property {string} format
 * @property {boolean} autoReply
 * @property {string[]} locales
 * @property {boolean} focused focusable
 * @property {number} difficulty delta
 * @property {number} discriminant alpha
 * @property {string} responsive
 * @property {string} genealogy
 * @property {string[]} attachments
 * @property {string} illustrationAlt
 * @property {string} illustrationUrl
 * @property {boolean} shuffled
 * @property {string} alternativeVersion
 * @property {string} blindnessCompatibility accessibility1
 * @property {string} colorBlindnessCompatibility accessibility2
 * @property {boolean} requireGafamWebsiteAccess
 * @property {boolean} isIncompatibleIpadCertif
 * @property {string} deafAndHardOfHearing
 * @property {boolean} isAwarenessChallenge
 * @property {boolean} toRephrase
 * @property {boolean} hasEmbedInternalValidation
 * @property {boolean} noValidationNeeded
 */

/**
 * @typedef WebComponentInfoApiDto
 * @type {object}
 * @property {string} challengeId
 * @property {string} webComponentTagName
 * @property {string} webComponentProps
 */

/**
 * @function
 * @name findValidatedByCompetenceId
 *
 * @param {string} competenceId
 * @param {string} locale
 * @returns {Promise<Array<ChallengeApiDto>>}
 */
export async function findValidatedByCompetenceId(competenceId, locale) {
  const challengeDtos = await findValidatedByCompetenceId_dtoonly(competenceId, locale);
  return challengeDtos.map(toChallengeApiDto);
}

/**
 * @function
 * @name findOperativeBySkills
 *
 * @param {string} skills
 * @param {string} locale
 * @returns {Promise<Array<ChallengeApiDto>>}
 */
export async function findOperativeBySkills(skills, locale) {
  const challengeDtos = await findOperativeBySkills_dtoonly(skills, locale);
  return challengeDtos.map(toChallengeApiDto);
}

/**
 * @function
 * @name get
 *
 * @param {string} id
 * @returns {Promise<ChallengeApiDto>}
 */
export async function get(id) {
  const challengeDto = await get_dtoonly(id);
  return toChallengeApiDto(challengeDto);
}

/**
 * @function
 * @name getWebComponentInfoFor
 *
 * @param {string} id
 * @returns {Promise<WebComponentInfoApiDto>}
 */
export async function getWebComponentInfoFor(id) {
  const challengeDto = await get_dtoonly(id);
  const webComponentInfo = await loadWebComponentInfo(challengeDto);
  return toWebComponentApiDto(id, webComponentInfo);
}

const toChallengeApiDto = (challengeDto) => new ChallengeApiDto(challengeDto);
const toWebComponentApiDto = (challengeId, webComponentInfo) =>
  new WebComponentInfoApiDto({ challengeId, ...webComponentInfo });

async function loadWebComponentInfo(challengeDto) {
  if (challengeDto.embedUrl == null || !challengeDto.embedUrl.endsWith('.json')) return null;

  const response = await httpAgent.get({ url: challengeDto.embedUrl });
  if (!response.isSuccessful) {
    throw new NotFoundError(
      `Embed webcomponent config with URL ${challengeDto.embedUrl} in challenge ${challengeDto.id} not found`,
    );
  }

  return {
    webComponentTagName: response.data.name,
    webComponentProps: response.data.props,
  };
}
