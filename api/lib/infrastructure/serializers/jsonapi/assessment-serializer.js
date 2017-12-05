const JSONAPISerializer = require('./jsonapi-serializer');

class AssessmentSerializer extends JSONAPISerializer {

  constructor() {
    super('assessment');
  }

  serializeAttributes(model, data) {
    data.attributes['success-rate'] = model.successRate;
    data.attributes['estimated-level'] = model.estimatedLevel;
    data.attributes['pix-score'] = model.pixScore;
    data.attributes['type'] = model.type;
    if (model.type === 'CERTIFICATION') {
      data.attributes['certification-number'] = model.courseId;
    } else {
      data.attributes['certification-number'] = null;
    }
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
    return {
      id: json.data.id,
      type : json.data.attributes.type,
      courseId: json.data.relationships.course.data.id
    };
  }

}

module.exports = new AssessmentSerializer();
