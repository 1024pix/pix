const BookshelfCampaignParticipation = require('../data/campaign-participation');
const CampaignParticipation = require('../../domain/models/CampaignParticipation');
const Campaign = require('../../domain/models/Campaign');
const Assessment = require('../../domain/models/Assessment');
const Skill = require('../../domain/models/Skill');
const User = require('../../domain/models/User');
const { NotFoundError } = require('../../domain/errors');
const queryBuilder = require('../utils/query-builder');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const { knex } = require('../bookshelf');
const knowledgeElementRepository = require('./knowledge-element-repository');
const knowledgeElementSnapshotRepository = require('./knowledge-element-snapshot-repository');

const fp = require('lodash/fp');
const _ = require('lodash');
const DomainTransaction = require('../DomainTransaction');

function _toDomain(bookshelfCampaignParticipation) {
  return new CampaignParticipation({
    id: bookshelfCampaignParticipation.get('id'),
    assessmentId: _getLastAssessmentIdForCampaignParticipation(bookshelfCampaignParticipation),
    campaign: new Campaign(bookshelfCampaignParticipation.related('campaign').toJSON()),
    campaignId: bookshelfCampaignParticipation.get('campaignId'),
    isShared: Boolean(bookshelfCampaignParticipation.get('isShared')),
    sharedAt: bookshelfCampaignParticipation.get('sharedAt'),
    createdAt: new Date(bookshelfCampaignParticipation.get('createdAt')),
    participantExternalId: bookshelfCampaignParticipation.get('participantExternalId'),
    userId: bookshelfCampaignParticipation.get('userId'),
    user: new User(bookshelfCampaignParticipation.related('user').toJSON()),
  });
}

module.exports = {

  async get(id, options = {}) {
    if (options.include) {
      options.include = _.union(options.include, ['assessments']);
    } else {
      options.include = ['assessments'];
    }

    const campaignParticipation = await queryBuilder.get(BookshelfCampaignParticipation, id, options, false);

    return _toDomain(campaignParticipation);
  },

  save(campaignParticipation, domainTransaction = DomainTransaction.emptyTransaction()) {
    return new BookshelfCampaignParticipation(_adaptModelToDb(campaignParticipation))
      .save(null, { transacting: domainTransaction.knexTransaction })
      .then(_toDomain);
  },

  async findProfilesCollectionResultDataByCampaignId(campaignId) {
    const results = await knex.with('campaignParticipationWithUser',
      (qb) => {
        qb.select([
          'campaign-participations.*',
          'schooling-registrations.studentNumber',
          'schooling-registrations.division',
          knex.raw('COALESCE ("schooling-registrations"."firstName", "users"."firstName") AS "firstName"'),
          knex.raw('COALESCE ("schooling-registrations"."lastName", "users"."lastName") AS "lastName"'),
        ])
          .from('campaign-participations')
          .leftJoin('users', 'campaign-participations.userId', 'users.id')
          .leftJoin('schooling-registrations', 'campaign-participations.userId', 'schooling-registrations.userId')
          .leftJoin('campaigns', function() {
            this.on({ 'campaign-participations.campaignId': 'campaigns.id' })
              .andOn({ 'campaigns.organizationId': 'schooling-registrations.organizationId' });
          })
          .where({ campaignId });
      })
      .from('campaignParticipationWithUser');

    return results.map(_rowToResult);
  },

  findLatestOngoingByUserId(userId) {
    return BookshelfCampaignParticipation
      .query((qb) => {
        qb.innerJoin('campaigns', 'campaign-participations.campaignId', 'campaigns.id');
        qb.whereNull('campaigns.archivedAt');
        qb.orderBy('campaign-participations.createdAt', 'DESC');
      })
      .where({ userId })
      .fetchAll({
        required: false,
        withRelated: ['campaign', 'assessments'],
      })
      .then((campaignParticipations) => bookshelfToDomainConverter.buildDomainObjects(BookshelfCampaignParticipation, campaignParticipations));
  },

  findOneByCampaignIdAndUserId({ campaignId, userId }) {
    return BookshelfCampaignParticipation
      .where({ campaignId, userId })
      .fetch()
      .then((campaignParticipation) => bookshelfToDomainConverter.buildDomainObject(BookshelfCampaignParticipation, campaignParticipation));
  },

  findOneByAssessmentIdWithSkillIds(assessmentId) {
    return BookshelfCampaignParticipation
      .query((qb) => {
        qb.innerJoin('campaigns', 'campaign-participations.campaignId', 'campaigns.id');
        qb.innerJoin('target-profiles', 'campaigns.targetProfileId', 'target-profiles.id');
        qb.innerJoin('target-profiles_skills', 'target-profiles.id', 'target-profiles_skills.targetProfileId');
        qb.innerJoin('assessments', 'assessments.campaignParticipationId', 'campaign-participations.id');
        qb.where('assessments.id', '=', assessmentId);
      })
      .fetch({
        required: false,
        withRelated: ['campaign.targetProfile.skillIds', 'assessments'],
      })
      .then(_convertToDomainWithSkills);
  },

  findByAssessmentId(assessmentId) {
    return BookshelfCampaignParticipation
      .query((qb) => {
        qb.innerJoin('assessments', 'assessments.campaignParticipationId', 'campaign-participations.id');
        qb.where('assessments.id', '=', assessmentId);
      })
      .fetchAll({ withRelated: ['campaign', 'user', 'assessments'] })
      .then((bookshelfCampaignParticipation) => bookshelfCampaignParticipation.models)
      .then(fp.map(_toDomain));
  },

  async share(campaignParticipation) {
    let savedBookshelfCampaignParticipation = null;
    try {
      savedBookshelfCampaignParticipation = await new BookshelfCampaignParticipation(campaignParticipation)
        .save({ isShared: true, sharedAt: new Date() }, { patch: true, require: true });
    } catch (err) {
      _checkNotFoundError(err);
    }

    const savedCampaignParticipation = _toDomain(savedBookshelfCampaignParticipation);

    const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({ userId: savedCampaignParticipation.userId, limitDate: savedCampaignParticipation.sharedAt });
    await knowledgeElementSnapshotRepository.save({ userId: savedCampaignParticipation.userId, snappedAt: savedCampaignParticipation.sharedAt, knowledgeElements });

    return savedCampaignParticipation;
  },

  count(filters = {}) {
    return BookshelfCampaignParticipation.where(filters).count();
  },

  countSharedParticipationOfCampaign(campaignId) {
    return this.count({ campaignId, isShared: true });
  },

  async isAssessmentCompleted(campaignParticipationId) {
    const assessment = await knex('assessments')
      .select('state')
      .where({ campaignParticipationId })
      .orderBy('assessments.createdAt', 'desc')
      .first();

    if (assessment) {
      return assessment.state === Assessment.states.COMPLETED;
    }
    return false;
  },
};

function _adaptModelToDb(campaignParticipation) {
  return {
    campaignId: campaignParticipation.campaignId,
    participantExternalId: campaignParticipation.participantExternalId,
    userId: campaignParticipation.userId,
  };
}

function _checkNotFoundError(err) {
  if (err instanceof BookshelfCampaignParticipation.NotFoundError) {
    throw new NotFoundError('Participation non trouvée');
  }
  throw err;
}

function _convertToDomainWithSkills(bookshelfCampaignParticipation) {
  if (!bookshelfCampaignParticipation) {
    return null;
  }

  // in database, the attribute is skillsIds in target-profiles_skills,
  // but in domain, the attribute is skills in class TargetProfile (TargetProfileSkills does not exists)
  bookshelfCampaignParticipation.attributes.assessmentId = _getLastAssessmentIdForCampaignParticipation(bookshelfCampaignParticipation);

  const skillsObjects = bookshelfCampaignParticipation.related('campaign').related('targetProfile').related('skillIds')
    .map((bookshelfSkillId) => new Skill({ id: bookshelfSkillId.get('skillId') }));
  bookshelfCampaignParticipation.related('campaign').related('targetProfile').set('skills', skillsObjects);

  return bookshelfToDomainConverter.buildDomainObject(BookshelfCampaignParticipation, bookshelfCampaignParticipation);
}

function _getLastAssessmentIdForCampaignParticipation(bookshelfCampaignParticipation) {
  const assessmentModels = bookshelfCampaignParticipation.related('assessments').models;
  if (assessmentModels.length) {
    const sortedAssessments = _.orderBy(assessmentModels, 'attributes.createdAt', 'desc');
    return sortedAssessments[0].attributes.id;
  }
  return null;
}

function _rowToResult(row) {
  return {
    id: row.id,
    createdAt: new Date(row.createdAt),
    isShared: Boolean(row.isShared),
    sharedAt: row.sharedAt ? new Date(row.sharedAt) : null,
    participantExternalId: row.participantExternalId,
    userId: row.userId,
    isCompleted: row.state === 'completed',
    studentNumber: row.studentNumber,
    participantFirstName: row.firstName,
    participantLastName: row.lastName,
    division: row.division,
  };
}
