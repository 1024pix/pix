const { Serializer } = require('jsonapi-serializer');
const AssessmentResult = require('../../../domain/models/AssessmentResult');

module.exports = {

  serialize(assessmentRating) {
    return new Serializer('assessment-results', {
      attributes: ['estimatedLevel', 'pixScore'],
    }).serialize(assessmentRating);
  },

  deserialize(json) {
    return new AssessmentResult({
      id: json.data.id,
      assessmentId: json.data.relationships.assessment.data.id
    });
  },

};
