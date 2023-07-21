import { ComplementaryCertification } from "../../domain/models/ComplementaryCertification.js";
import { ComplementaryCertificationForAdmin } from "../../domain/models/ComplementaryCertificationForAdmin.js";
import { knex } from "../../../db/knex-database-connection.js";

function _toDomain(row) {
  return new ComplementaryCertification({
    ...row,
  });
}

const findAll = async function () {
  const result = await knex.from('complementary-certifications').select('id', 'label', 'key').orderBy('id', 'asc');

  return result.map(_toDomain);
};

const getByLabel = async function ({ label }) {
  const result = await knex.from('complementary-certifications').where({ label }).first();

  return _toDomain(result);
};

const getTargetProfileById = async function ({ complementaryCertificationId }) {
  const currentProfile = await knex('complementary-certification-badges')
    .select({
      id: 'target-profiles.id',
      name: 'target-profiles.name',
    })
    .leftJoin('badges', 'badges.id', 'complementary-certification-badges.badgeId')
    .leftJoin('target-profiles', 'target-profiles.id', 'badges.targetProfileId')
    .where({ complementaryCertificationId })
    .orderBy('complementary-certification-badges.createdAt', 'desc')
    .first();

  const currentTargetProfileBadges = await knex('badges')
    .select({
      id: 'complementary-certification-badges.id',
      name: 'complementary-certification-badges.label',
      level: 'complementary-certification-badges.level',
    })
    .leftJoin('complementary-certification-badges', 'complementary-certification-badges.badgeId', 'badges.id')
    .where({ targetProfileId: currentProfile.id });

  const complementaryCertification = await knex
    .from('complementary-certifications')
    .where({ id: complementaryCertificationId })
    .first();

  return new ComplementaryCertificationForAdmin({
    ...complementaryCertification,
    currentTargetProfile: { ...currentProfile, badges: [...currentTargetProfileBadges] },
  });
};

export { findAll, getByLabel, getTargetProfileById };
