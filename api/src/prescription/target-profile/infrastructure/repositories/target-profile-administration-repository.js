import _ from 'lodash';

import { knex } from '../../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError, ObjectValidationError } from '../../../../shared/domain/errors.js';
import { TargetProfile } from '../../../../shared/domain/models/index.js';

const TARGET_PROFILE_TABLE = 'target-profiles';

const update = async function (targetProfile) {
  let results;
  const editedAttributes = _.pick(targetProfile, ['name', 'outdated', 'description', 'comment', 'isSimplifiedAccess']);

  try {
    results = await knex('target-profiles')
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

const create = async function ({ targetProfileForCreation }) {
  const knexConn = DomainTransaction.getConnection();
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

const getTubesByTargetProfileId = async (targetProfileId) => {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('target-profile_tubes').select('tubeId', 'level').where('targetProfileId', targetProfileId);
};

export { create, getTubesByTargetProfileId, update };
