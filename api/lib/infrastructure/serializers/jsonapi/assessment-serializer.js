const JSONAPISerializer = require('./jsonapi-serializer');
const Assessment = require('../../../domain/models/data/assessment');

class AssessmentSerializer extends JSONAPISerializer {

  constructor() {
    super('assessment');
  }

  serializeAttributes(model, data) {
    data.attributes['success-rate'] = model.successRate;
    data.attributes['estimated-level'] = model.estimatedLevel;
    data.attributes['pix-score'] = model.pixScore;
  }

  serializeRelationships(model, data) {
    data.relationships = {};

    data.relationships.course = {
      data: {
        type: 'courses',
        id: model.courseId
      }
    };

    if (model.answers) {
      data.relationships.answers = {
        data: []
      };
      for (const answer of model.answers) {
        data.relationships.answers.data.push({
          'type': 'answers',
          'id': answer.id
        });
      }
    }
  }

  deserialize(json) {
    return new Assessment({
      id: json.data.id,
      courseId: json.data.relationships.course.data.id
    });
  }

}

module.exports = new AssessmentSerializer();
