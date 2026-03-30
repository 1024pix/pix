import { NotFoundError } from '../../../shared/domain/errors.js';
import { getInstance } from '../../../shared/infrastructure/repositories/challenge-repository.js';
import { child, SCOPES } from '../../../shared/infrastructure/utils/logger.js';
import { BaseChallenge } from '../../domain/models/BaseChallenge.js';

const logger = child('learningcontent:repository', { event: SCOPES.LEARNING_CONTENT });

/**
 * @function
 * @name findInIdsByStatusAndLocale
 *
 * @param {Object} params
 * @param {string[]} params.ids
 * @param {string} params.status
 * @param {string} params.locale
 * @returns {Promise<BaseChallenge[]>}
 * @throws NotFoundError when at least one challenge in the given ids is not found
 */
export async function findInIdsByStatusAndLocale({ ids, status, locale }) {
  const sortedIds = [...ids].sort();
  // ou alors loadMany + filtre status/locale en JS ?
  // plutot que trier les ids et créer la grosse chaine de caractères
  // penser à hasher les clés ?
  // deep freeze le dto en cache ?
  const uniqueCacheKey = `findInIdsByStatusAndLocale({ ids: ${ids.sort().join(',')}, status: ${status}, locale: ${locale} })`;

  const findCallback = async (lcmsKnex) => {
    return lcmsKnex
      .whereIn('id', sortedIds)
      .where('status', status)
      .whereRaw('?=ANY(??)', [locale, 'locales'])
      .orderBy('id');
  };
  const challengeDtos = await getInstance().find(uniqueCacheKey, findCallback);
  return challengeDtos.map((challengeDto) => new BaseChallenge(challengeDto));
}

/**
 * @function
 * @name findInIds
 *
 * @param {Object} params
 * @param {string[]} params.ids
 * @returns {Promise<BaseChallenge[]>}
 * @throws NotFoundError when at least one challenge in the given ids is not found
 */
export async function findInIds({ ids }) {
  const challengeDtos = await getInstance().loadMany(ids);

  challengeDtos.forEach((challengeDto, index) => {
    if (challengeDto) return;
    logger.warn({ challengeId: ids[index] }, 'Épreuve introuvable');
    throw new NotFoundError('Épreuve introuvable');
  });

  return challengeDtos.map((challengeDto) => new BaseChallenge(challengeDto));
}
