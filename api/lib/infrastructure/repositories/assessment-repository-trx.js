const _ = require('lodash');

class AssessmentRepository {
  constructor(queryBuilder) {
    this.queryBuilder = queryBuilder;
  }

  async save({ assessment }) {
    const attributes = _.omit(assessment, ['answers', 'campaignParticipation', 'course', 'targetProfile', 'title', 'createdAt']);
    const [id] = await this.queryBuilder('assessments').insert(attributes).returning('id');
    assessment.id = id
  }
}
module.exports = AssessmentRepository;
