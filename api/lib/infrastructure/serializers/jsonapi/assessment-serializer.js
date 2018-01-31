const JSONAPISerializer = require('./jsonapi-serializer');
const Bookshelf = require('../../../infrastructure/bookshelf');

class AssessmentSerializer extends JSONAPISerializer {

  constructor() {
    super('assessment');
  }

  serialize(modelObject) {
    const response = {};
    response.included = [];

    response.data = this.serializeModelObject(modelObject);
    const includedData = this.serializeIncluded(modelObject);
    if (includedData) {
      response.included.push(includedData);
    }

    return response;
  }

  serializeArray(modelObjects) {
    const response = {};
    response.data = [];
    response.included = [];
    for (const modelObject of modelObjects) {
      response.data.push(this.serializeModelObject(modelObject));
      const includedData = this.serializeIncluded(modelObject);
      if (includedData) {
        response.included.push(includedData);
      }
    }
    return response;
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

  serializeIncluded(modelObject) {
    const course = (modelObject instanceof Bookshelf.Model) ? modelObject.toJSON().course : modelObject.course;
    if (course) {
      return {
        'type': 'courses',
        'id': course.id,
        attributes: {
          'name': course.name,
          'description': course.description,
          'nb-challenges': course.nbChallenges.toString()
        }
      };
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
