const AssessmentResult = require('../../../domain/models/AssessmentResult');

module.exports = {

  deserialize(json) {
    return new AssessmentResult({
      id: json.data.id,
      assessmentId: json.data.relationships.assessment.data.id
    });
  },
};
