const BookshelfCampaignParticipation = require('../data/campaign-participation');
const CampaignParticipation = require('../../domain/models/CampaignParticipation');
const Campaign = require('../../domain/models/Campaign');
const Skill = require('../../domain/models/Skill');
const User = require('../../domain/models/User');
const { NotFoundError } = require('../../domain/errors');
const queryBuilder = require('../utils/query-builder');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const fp = require('lodash/fp');
const _ = require('lodash');

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

  save(campaignParticipation) {
    return new BookshelfCampaignParticipation(_adaptModelToDb(campaignParticipation))
      .save()
      .then(_toDomain);
  },

  async findResultDataByCampaignId(campaignId) {
    const { models } = await BookshelfCampaignParticipation
      .where({ campaignId })
      .fetchAll({
        withRelated: {
          user: (qb) => { qb.columns('id', 'firstName', 'lastName'); }
        }
      });

    return models.map((bookshelfCampaignParticipation) => {
      return {
        id: bookshelfCampaignParticipation.get('id'),
        createdAt: new Date(bookshelfCampaignParticipation.get('createdAt')),

        isShared: Boolean(bookshelfCampaignParticipation.get('isShared')),
        sharedAt: bookshelfCampaignParticipation.get('sharedAt'),
        participantExternalId: bookshelfCampaignParticipation.get('participantExternalId'),
        userId: bookshelfCampaignParticipation.get('userId'),

        participantFirstName: bookshelfCampaignParticipation.related('user').get('firstName'),
        participantLastName: bookshelfCampaignParticipation.related('user').get('lastName'),
      };
    });
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
        withRelated: ['campaign.targetProfile.skillIds', 'assessments']
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

  findPaginatedCampaignParticipations(options) {
    return BookshelfCampaignParticipation
      .where(options.filter)
      .query((qb) => {
        qb.innerJoin('users', 'campaign-participations.userId', 'users.id');
        qb.orderByRaw('LOWER(users."lastName") ASC, LOWER(users."firstName") ASC');

      })
      .fetchPage({
        page: options.page.number,
        pageSize: options.page.size,
        withRelated: ['user', 'assessments', 'user.knowledgeElements']
      })
      .then(({ models, pagination }) => {
        _.map(models, (campaignParticipation) => {
          campaignParticipation.attributes.assessmentId = _getLastAssessmentIdForCampaignParticipation(campaignParticipation);
        });

        const campaignParticipations = bookshelfToDomainConverter.buildDomainObjects(BookshelfCampaignParticipation, models);
        const campaignParticipationsWithUniqKnowledgeElements = _sortUniqKnowledgeElements(campaignParticipations);
        return { models: campaignParticipationsWithUniqKnowledgeElements, pagination };
      });
  },

  share(campaignParticipation) {
    return new BookshelfCampaignParticipation(campaignParticipation)
      .save({ isShared: true, sharedAt: new Date() }, { patch: true, require: true })
      .then(_toDomain)
      .catch(_checkNotFoundError);
  },

  count(filters = {}) {
    return BookshelfCampaignParticipation.where(filters).count();
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

function _sortUniqKnowledgeElements(campaignParticipations) {
  return _.each(campaignParticipations, (campaignParticipation) => {
    campaignParticipation.user.knowledgeElements = _(campaignParticipation.user.knowledgeElements)
      .filter((ke) => ke.createdAt < campaignParticipation.sharedAt)
      .orderBy('createdAt', 'desc')
      .uniqBy('skillId')
      .value();
  });
}

function _getLastAssessmentIdForCampaignParticipation(bookshelfCampaignParticipation) {
  const assessmentModels = bookshelfCampaignParticipation.related('assessments').models;
  if (assessmentModels.length) {
    const sortedAssessments = _.orderBy(assessmentModels, 'attributes.createdAt', 'desc');
    return sortedAssessments[0].attributes.id;
  }
  return null;
}
