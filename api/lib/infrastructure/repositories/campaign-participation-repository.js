const BookshelfCampaignParticipation = require('../data/campaign-participation');
const CampaignParticipation = require('../../domain/models/CampaignParticipation');
const Campaign = require('../../domain/models/Campaign');
const Skill = require('../../domain/models/Skill');
const User = require('../../domain/models/User');
const Assessment = require('../../domain/models/Assessment');
const { NotFoundError } = require('../../domain/errors');
const queryBuilder = require('../utils/query-builder');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const fp = require('lodash/fp');
const _ = require('lodash');

function _toDomain(bookshelfCampaignParticipation) {
  const assessments = _.map(bookshelfCampaignParticipation.related('assessment').models, (assessment) => assessment.toJSON());
  const recentAssessment = _.orderBy(assessments, 'createdAt', 'desc')[0];
  return new CampaignParticipation({
    id: bookshelfCampaignParticipation.get('id'),
    assessment: new Assessment(recentAssessment),
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

  async get(id, options) {
    const optionsForQueryBuilder = options || {};
    if (!_.get(optionsForQueryBuilder, 'include', []).includes['assessment']) {
      const optionInclude = optionsForQueryBuilder.include || [];
      optionInclude.push('assessment');
      optionsForQueryBuilder.include = optionInclude;
    }
    const campaignParticipation = await queryBuilder.get(BookshelfCampaignParticipation, id, optionsForQueryBuilder, false);

    return _toDomain(campaignParticipation);
  },

  save(campaignParticipation) {
    return new BookshelfCampaignParticipation(_adaptModelToDb(campaignParticipation))
      .save()
      .then(_toDomain);
  },

  findByCampaignId(campaignId) {
    return BookshelfCampaignParticipation
      .where({ campaignId })
      .fetchAll({ withRelated: ['campaign', 'assessment'] })
      .then((bookshelfCampaignParticipation) => bookshelfCampaignParticipation.models)
      .then(fp.map(_toDomain));
  },

  findByUserId(userId) {
    return BookshelfCampaignParticipation
      .where({ userId })
      .orderBy('createdAt', 'DESC')
      .fetchAll({ withRelated: ['campaign', 'assessment'] })
      .then((bookshelfCampaignParticipation) => bookshelfCampaignParticipation.models)
      .then(fp.map(_toDomain));
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
      .fetch({ required: false, withRelated: ['campaign.targetProfile.skillIds', 'assessment'] })
      .then(_convertToDomainWithSkills);
  },

  findByAssessmentId(assessmentId) {
    return BookshelfCampaignParticipation
      .query((qb) => {
        qb.innerJoin('assessments', 'assessments.campaignParticipationId', 'campaign-participations.id');
        qb.where('assessments.id', '=', assessmentId);
      })
      .fetchAll({ withRelated: ['campaign', 'user', 'assessment'] })
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
        withRelated: ['user', 'assessment', 'user.knowledgeElements']
      })
      .then(({ models, pagination }) => {
        _.map(models, (campaignParticipation) => {
          const assessments = _.map(campaignParticipation.related('assessment').models, (assessment) => assessment.toJSON());
          const recentAssessment = _.orderBy(assessments, 'createdAt', 'desc')[0];
          campaignParticipation.relations.assessment = new Assessment(recentAssessment);
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

  const assessments = _.map(bookshelfCampaignParticipation.related('assessment').models, (assessment) => assessment.toJSON());
  const recentAssessment = _.orderBy(assessments, 'createdAt', 'desc')[0];
  bookshelfCampaignParticipation.relations.assessment = new Assessment(recentAssessment);

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
