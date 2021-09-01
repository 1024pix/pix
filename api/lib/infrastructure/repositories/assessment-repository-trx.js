const _ = require('lodash');
const Assessment = require('../../../../api/lib/domain/models/Assessment');
const Answer = require('../../../../api/lib/domain/models/Answer');
const CampaignParticipation = require('../../../../api/lib/domain/models/CampaignParticipation');
const Campaign = require('../../../../api/lib/domain/models/Campaign');
const BookshelfAssessment = require('../orm-models/Assessment');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const { NotFoundError } = require('../../domain/errors');
const { groupBy, map, head } = require('lodash');

class AssessmentRepository {
  constructor(queryBuilder) {
    this.queryBuilder = queryBuilder;
  }

  async save({ assessment }) {
    const attributes = _.omit(assessment, ['answers', 'campaignParticipation', 'course', 'targetProfile', 'title', 'createdAt']);
    const [id] = await this.queryBuilder('assessments').insert(attributes).returning('id');
    assessment.id = id;
  }

  async getWithAnswersAndCampaignParticipation(id) {
    const assessmentAttributes = await this.queryBuilder('assessments').where({ id }).first();
    if (assessmentAttributes) {
      const answers = await this._fetchAnswers(id);
      const campaignParticipation = await this._fetchParticipation(assessmentAttributes.campaignParticipationId);
      return new Assessment({ ...assessmentAttributes, answers, campaignParticipation });
    } else {
      return null;
    }
  }

  async get(id) {
    const assessmentAttributes = await this.queryBuilder('assessments').where({ id }).first();
    if (assessmentAttributes) {
      return new Assessment(assessmentAttributes);
    }
    throw new NotFoundError('L\'assessment n\'existe pas ou son accès est restreint');
  }

  async findLastCompletedAssessmentsForEachCompetenceByUser(userId, limitDate) {
    const assessmentsAttributes = await this.queryBuilder('assessments')
      .select('assessments.*')
      .join('assessment-results', 'assessment-results.assessmentId', 'assessments.id')
      .where({ userId, type: 'PLACEMENT', state: 'completed' })
      .where('assessments.createdAt', '<', limitDate)
      .where('assessment-results.createdAt', '<', limitDate)
      .orderBy('assessments.createdAt', 'desc');

    const assessments = assessmentsAttributes.map((attributes) => new Assessment(attributes));
    return _selectLastAssessmentForEachCompetence(assessments);
  }

  async getByAssessmentIdAndUserId(assessmentId, userId) {
    const attributes = await this.queryBuilder('assessments')
      .select('assessments.*')
      .where({ userId, id: assessmentId })
      .first();

    if (attributes) {
      return new Assessment(attributes);
    }
    throw new NotFoundError();
  }

  async getIdByCertificationCourseId(certificationCourseId) {
    const [id] = await this.queryBuilder('assessments')
      .pluck('id')
      .where({ certificationCourseId, type: Assessment.types.CERTIFICATION });
    return id || null;
  }

  async _fetchAnswers(id) {
    const answersAttributes = await this.queryBuilder('answers').where({ assessmentId: id });
    const answers = answersAttributes.map((attributes) => new Answer(attributes));
    return answers;
  }

  async _fetchParticipation(id) {
    if (id) {
      const campaignParticipationAttributes = await this.queryBuilder('campaign-participations').where({ id }).first();
      const campaignAttributes = await this.queryBuilder('campaigns').where({ id: campaignParticipationAttributes.campaignId }).first();
      const campaign = new Campaign(campaignAttributes);
      return new CampaignParticipation({ ...campaignParticipationAttributes, campaign });
    }
    return undefined;
  }
}

function _selectLastAssessmentForEachCompetence(assessments) {
  const assessmentsGroupedByCompetence = groupBy(assessments, 'competenceId');
  return map(assessmentsGroupedByCompetence, head);
}

module.exports = AssessmentRepository;
