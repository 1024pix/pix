const { Serializer } = require('jsonapi-serializer');
const AssessmentRating = require('../../../domain/models/AssessmentRating');

module.exports = {

  serialize(assessmentRating) {
    return new Serializer('assessment-ratings', {
      attributes: ['estimatedLevel', 'pixScore'],
    }).serialize(assessmentRating);
  },

  deserialize(json) {
    return new AssessmentRating({
      id: json.data.id,
      assessmentId: json.data.relationships.assessment.data.id
    });
  }

};
