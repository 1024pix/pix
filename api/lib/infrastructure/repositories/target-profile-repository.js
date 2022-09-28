const _ = require('lodash');
const BookshelfTargetProfile = require('../orm-models/TargetProfile');
const targetProfileAdapter = require('../adapters/target-profile-adapter');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const { knex } = require('../../../db/knex-database-connection');
const { NotFoundError, ObjectValidationError, InvalidSkillSetError } = require('../../domain/errors');
const DomainTransaction = require('../../infrastructure/DomainTransaction');
const TargetProfile = require('../../domain/models/TargetProfile');
const Stage = require('../../domain/models/Stage');

const TARGET_PROFILE_TABLE = 'target-profiles';

module.exports = {
  async createWithTubes({ targetProfileForCreation, domainTransaction }) {
    const knexConn = domainTransaction.knexTransaction;
    const targetProfileRawData = _.pick(targetProfileForCreation, [
      'name',
      'category',
      'description',
      'comment',
      'isPublic',
      'imageUrl',
      'ownerOrganizationId',
    ]);
    const [{ id: targetProfileId }] = await knexConn(TARGET_PROFILE_TABLE).insert(targetProfileRawData).returning('id');

    const tubesData = targetProfileForCreation.tubes.map((tube) => ({
      targetProfileId,
      tubeId: tube.id,
      level: tube.level,
    }));
    await knexConn.batchInsert('target-profile_tubes', tubesData);

    return targetProfileId;
  },

  async updateTargetProfileWithSkills({ targetProfileId, skills, domainTransaction }) {
    const knexConn = domainTransaction.knexTransaction;
    const skillsToAdd = skills.map((skill) => {
      return { targetProfileId, skillId: skill.id };
    });
    await knexConn.batchInsert('target-profiles_skills', skillsToAdd);
  },

  async get(id, domainTransaction = DomainTransaction.emptyTransaction()) {
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
  },

  async getByCampaignId(campaignId) {
    const bookshelfTargetProfile = await BookshelfTargetProfile.query((qb) => {
      qb.innerJoin('campaigns', 'campaigns.targetProfileId', 'target-profiles.id');
    })
      .where({ 'campaigns.id': campaignId })
      .fetch({
        withRelated: [
          {
            stages: function (query) {
              query.orderBy('threshold', 'ASC');
            },
          },
          'badges',
        ],
      });
    return targetProfileAdapter.fromDatasourceObjects({
      bookshelfTargetProfile,
    });
  },

  /**
   * @deprecated Use findSkillIds from campaignRepository
   * @param campaignId
   * @param {DomainTransaction=} domainTransaction
   * @returns skillIds
   */
  async getTargetProfileSkillIdsByCampaignId(campaignId, domainTransaction) {
    const knexConn = domainTransaction?.knexTransaction ?? knex;
    return knexConn('target-profiles_skills')
      .join('campaigns', 'campaigns.targetProfileId', 'target-profiles_skills.targetProfileId')
      .where('campaigns.id', campaignId)
      .pluck('skillId');
  },

  /**
   * @deprecated TargetProfile skill will disappear
   * @param targetProfileId
   * @param {DomainTransaction=} domainTransaction
   * @returns skillIds
   */
  async getTargetProfileSkillIds(targetProfileId, domainTransaction) {
    const knexConn = domainTransaction?.knexTransaction ?? knex;
    return knexConn('target-profiles_skills').pluck('skillId').where({ targetProfileId });
  },

  async findByIds(targetProfileIds) {
    const targetProfilesBookshelf = await BookshelfTargetProfile.query((qb) => {
      qb.whereIn('id', targetProfileIds);
    }).fetchAll();

    return bookshelfToDomainConverter.buildDomainObjects(BookshelfTargetProfile, targetProfilesBookshelf);
  },

  async update(targetProfile) {
    let results;
    const editedAttributes = _.pick(targetProfile, [
      'name',
      'outdated',
      'description',
      'comment',
      'isSimplifiedAccess',
    ]);

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
  },

  async findOrganizationIds(targetProfileId) {
    const targetProfile = await knex(TARGET_PROFILE_TABLE).select('id').where({ id: targetProfileId }).first();
    if (!targetProfile) {
      throw new NotFoundError(`No target profile for ID ${targetProfileId}`);
    }

    const targetProfileShares = await knex('target-profile-shares')
      .select('organizationId')
      .where({ 'target-profile-shares.targetProfileId': targetProfileId });
    return targetProfileShares.map((targetProfileShare) => targetProfileShare.organizationId);
  },

  async hasSkills({ targetProfileId, skillIds }, { knexTransaction } = DomainTransaction.emptyTransaction()) {
    const result = await (knexTransaction ?? knex)('target-profiles_skills')
      .select('skillId')
      .whereIn('skillId', skillIds)
      .andWhere('targetProfileId', targetProfileId);

    const unknownSkillIds = _.difference(skillIds, _.map(result, 'skillId'));
    if (unknownSkillIds.length) {
      throw new InvalidSkillSetError(`Les acquis suivants ne font pas partie du profil cible : ${unknownSkillIds}`);
    }

    return true;
  },

  async findStages({ targetProfileId }) {
    const stages = await knex('stages').where({ targetProfileId }).orderBy(['stages.threshold', 'stages.level']);
    return stages.map((stage) => new Stage(stage));
  },
};
