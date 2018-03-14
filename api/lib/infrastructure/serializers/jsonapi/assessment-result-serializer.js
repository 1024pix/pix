const { Serializer } = require('jsonapi-serializer');
const AssessmentResult = require('../../../domain/models/AssessmentResult');
const CompetenceMark = require('../../../domain/models/CompetenceMark');

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

  deserializeResultsAdd(json) {
    const assessmentResult = new AssessmentResult({
      assessmentId: json['assessment-id'],
      emitter: json.emitter,
      status: json.status,
      comment: json.comment,
      level: json.level,
      pixScore: json['pix-score'],
    });

    const competenceMarks = json['competences-with-mark'].map((competenceMark) => {
      return new CompetenceMark({
        level: competenceMark.level,
        score: competenceMark.score,
        area_code: competenceMark['area-code'],
        competence_code: competenceMark['competence-code'],
      });
    });
    return { assessmentResult, competenceMarks };
  }

};
