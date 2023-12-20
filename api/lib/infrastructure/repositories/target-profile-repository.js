import _ from 'lodash';
import { BookshelfTargetProfile } from '../orm-models/TargetProfile.js';
import * as targetProfileAdapter from '../adapters/target-profile-adapter.js';
import * as bookshelfToDomainConverter from '../utils/bookshelf-to-domain-converter.js';
import { knex } from '../../../db/knex-database-connection.js';
import { ObjectValidationError } from '../../domain/errors.js';
import { NotFoundError } from '../../../src/shared/domain/errors.js';
import { DomainTransaction } from '../DomainTransaction.js';
import { TargetProfile } from '../../domain/models/index.js';

const TARGET_PROFILE_TABLE = 'target-profiles';

const create = async function ({ targetProfileForCreation, domainTransaction }) {
  const knexConn = domainTransaction.knexTransaction;
  const targetProfileRawData = _.pick(targetProfileForCreation, [
    'name',
    'category',
    'description',
    'comment',
    'isPublic',
    'imageUrl',
    'ownerOrganizationId',
    'areKnowledgeElementsResettable',
  ]);
  const [{ id: targetProfileId }] = await knexConn(TARGET_PROFILE_TABLE).insert(targetProfileRawData).returning('id');

  const tubesData = targetProfileForCreation.tubes.map((tube) => ({
    targetProfileId,
    tubeId: tube.id,
    level: tube.level,
  }));
  await knexConn.batchInsert('target-profile_tubes', tubesData);

  return targetProfileId;
};

const get = async function (id, domainTransaction = DomainTransaction.emptyTransaction()) {
  const bookshelfTargetProfile = await BookshelfTargetProfile.where({ id }).fetch({
    require: false,
    transacting: domainTransaction.knexTransaction,
  });

  if (!bookshelfTargetProfile) {
    throw new NotFoundError(`Le profil cible avec l'id ${id} n'existe pas`);
  }

  return targetProfileAdapter.fromDatasourceObjects({
    bookshelfTargetProfile,
  });
};

const findByIds = async function (targetProfileIds) {
  const targetProfilesBookshelf = await BookshelfTargetProfile.query((qb) => {
    qb.whereIn('id', targetProfileIds);
  }).fetchAll();

  return bookshelfToDomainConverter.buildDomainObjects(BookshelfTargetProfile, targetProfilesBookshelf);
};

const update = async function (targetProfile) {
  let results;
  const editedAttributes = _.pick(targetProfile, ['name', 'outdated', 'description', 'comment', 'isSimplifiedAccess']);

  try {
    results = await knex(TARGET_PROFILE_TABLE)
      .where({ id: targetProfile.id })
      .update(editedAttributes)
      .returning(['id', 'isSimplifiedAccess']);
  } catch (error) {
    throw new ObjectValidationError();
  }

  if (!results.length) {
    throw new NotFoundError(`Le profil cible avec l'id ${targetProfile.id} n'existe pas`);
  }

  return new TargetProfile(results[0]);
};

const findOrganizationIds = async function (targetProfileId) {
  const targetProfile = await knex(TARGET_PROFILE_TABLE).select('id').where({ id: targetProfileId }).first();
  if (!targetProfile) {
    throw new NotFoundError(`No target profile for ID ${targetProfileId}`);
  }

  const targetProfileShares = await knex('target-profile-shares')
    .select('organizationId')
    .where({ 'target-profile-shares.targetProfileId': targetProfileId });
  return targetProfileShares.map((targetProfileShare) => targetProfileShare.organizationId);
};

const hasTubesWithLevels = async function (
  { targetProfileId, tubesWithLevels },
  { knexTransaction } = DomainTransaction.emptyTransaction(),
) {
  const tubeIds = tubesWithLevels.map(({ id }) => id);

  const result = await (knexTransaction ?? knex)('target-profile_tubes')
    .whereIn('tubeId', tubeIds)
    .andWhere('targetProfileId', targetProfileId);

  for (const tubeWithLevel of tubesWithLevels) {
    const targetProfileTube = result.find(({ tubeId }) => tubeId === tubeWithLevel.id);
    if (!targetProfileTube) {
      throw new ObjectValidationError(`Le sujet ${tubeWithLevel.id} ne fait pas partie du profil cible`);
    }

    if (tubeWithLevel.level > targetProfileTube.level) {
      throw new ObjectValidationError(
        `Le niveau ${tubeWithLevel.level} dépasse le niveau max du sujet ${tubeWithLevel.id}`,
      );
    }
  }
};

export { create, get, findByIds, update, findOrganizationIds, hasTubesWithLevels };
