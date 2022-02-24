const _ = require('lodash');

const bluebird = require('bluebird');
const BookshelfTargetProfile = require('../orm-models/TargetProfile');
const skillDatasource = require('../datasources/learning-content/skill-datasource');
const targetProfileAdapter = require('../adapters/target-profile-adapter');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const { knex } = require('../bookshelf');
const {
  TargetProfileCannotBeCreated,
  NotFoundError,
  ObjectValidationError,
  InvalidSkillSetError,
} = require('../../domain/errors');
const DomainTransaction = require('../../infrastructure/DomainTransaction');

module.exports = {
  async create(targetProfileData) {
    const targetProfileRawData = _.pick(targetProfileData, [
      'name',
      'isPublic',
      'imageUrl',
      'ownerOrganizationId',
      'comment',
      'description',
      'category',
    ]);

    const trx = await knex.transaction();

    try {
      const [targetProfileId] = await trx('target-profiles').insert(targetProfileRawData).returning('id');

      const skillsIdList = _.uniq(targetProfileData.skillIds);

      const skillToAdd = skillsIdList.map((skillId) => {
        return { targetProfileId, skillId };
      });

      await trx.batchInsert('target-profiles_skills', skillToAdd);

      await trx.commit();

      return targetProfileId;
    } catch (e) {
      await trx.rollback();

      throw new TargetProfileCannotBeCreated();
    }
  },

  async get(id, domainTransaction = DomainTransaction.emptyTransaction()) {
    const targetProfileBookshelf = await BookshelfTargetProfile.where({ id }).fetch({
      require: false,
      withRelated: ['skillIds'],
      transacting: domainTransaction.knexTransaction,
    });

    if (!targetProfileBookshelf) {
      throw new NotFoundError(`Le profil cible avec l'id ${id} n'existe pas`);
    }

    return _getWithLearningContentSkills(targetProfileBookshelf);
  },

  async getByCampaignId(campaignId) {
    const targetProfileBookshelf = await BookshelfTargetProfile.query((qb) => {
      qb.innerJoin('campaigns', 'campaigns.targetProfileId', 'target-profiles.id');
      qb.innerJoin('target-profiles_skills', 'target-profiles_skills.targetProfileId', 'target-profiles.id');
    })
      .where({ 'campaigns.id': campaignId })
      .fetch({
        withRelated: [
          'skillIds',
          {
            stages: function (query) {
              query.orderBy('threshold', 'ASC');
            },
          },
        ],
      });

    return _getWithLearningContentSkills(targetProfileBookshelf);
  },

  async getByCampaignParticipationId(campaignParticipationId) {
    const targetProfileBookshelf = await BookshelfTargetProfile.query((qb) => {
      qb.innerJoin('campaigns', 'campaigns.targetProfileId', 'target-profiles.id');
      qb.innerJoin('campaign-participations', 'campaign-participations.campaignId', 'campaigns.id');
      qb.innerJoin('target-profiles_skills', 'target-profiles_skills.targetProfileId', 'target-profiles.id');
    })
      .where({ 'campaign-participations.id': campaignParticipationId })
      .fetch({
        withRelated: [
          'skillIds',
          {
            stages: function (query) {
              query.orderBy('threshold', 'ASC');
            },
          },
        ],
      });

    return _getWithLearningContentSkills(targetProfileBookshelf);
  },

  async findAllTargetProfilesOrganizationCanUse(ownerOrganizationId) {
    const targetProfilesBookshelf = await BookshelfTargetProfile.query((qb) => {
      qb.where({ ownerOrganizationId, outdated: false });
      qb.orWhere({ isPublic: true, outdated: false });
    }).fetchAll({ withRelated: ['skillIds'] });

    return bluebird.mapSeries(targetProfilesBookshelf, _getWithLearningContentSkills);
  },

  async findByIds(targetProfileIds) {
    const targetProfilesBookshelf = await BookshelfTargetProfile.query((qb) => {
      qb.whereIn('id', targetProfileIds);
    }).fetchAll();

    return bookshelfToDomainConverter.buildDomainObjects(BookshelfTargetProfile, targetProfilesBookshelf);
  },

  findPaginatedFiltered({ filter, page }) {
    return BookshelfTargetProfile.query((qb) => _setSearchFiltersForQueryBuilder(filter, qb))
      .fetchPage({
        page: page.number,
        pageSize: page.size,
      })
      .then(({ models, pagination }) => {
        const targetProfiles = bookshelfToDomainConverter.buildDomainObjects(BookshelfTargetProfile, models);
        return { models: targetProfiles, pagination };
      });
  },

  async update(targetProfile) {
    let targetProfileUpdatedRowCount;
    const editedAttributes = _.pick(targetProfile, ['name', 'outdated', 'description', 'comment']);

    try {
      targetProfileUpdatedRowCount = await knex('target-profiles')
        .where({ id: targetProfile.id })
        .update(editedAttributes);
    } catch (error) {
      throw new ObjectValidationError();
    }

    if (targetProfileUpdatedRowCount !== 1) {
      throw new NotFoundError(`Le profil cible avec l'id ${targetProfile.id} n'existe pas`);
    }
  },

  async findOrganizationIds(targetProfileId) {
    const targetProfile = await knex('target-profiles').select('id').where({ id: targetProfileId }).first();
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
      throw new InvalidSkillSetError(`Unknown skillIds : ${unknownSkillIds}`);
    }

    return true;
  },
};

async function _getWithLearningContentSkills(targetProfile) {
  const associatedSkillDatasourceObjects = await _getLearningContentDataObjectsSkills(targetProfile);

  return targetProfileAdapter.fromDatasourceObjects({
    bookshelfTargetProfile: targetProfile,
    associatedSkillDatasourceObjects,
  });
}

function _getLearningContentDataObjectsSkills(bookshelfTargetProfile) {
  const skillRecordIds = bookshelfTargetProfile
    .related('skillIds')
    .map((BookshelfSkillId) => BookshelfSkillId.get('skillId'));
  return skillDatasource.findOperativeByRecordIds(skillRecordIds);
}

function _setSearchFiltersForQueryBuilder(filter, qb) {
  const { name, id } = filter;
  if (name) {
    qb.whereRaw('LOWER("name") LIKE ?', `%${name.toLowerCase()}%`);
  }
  if (id) {
    qb.where({ id });
  }
}
