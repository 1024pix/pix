const JSONAPISerializer = require('./jsonapi-serializer');
const Bookshelf = require('../../../infrastructure/bookshelf');
const Assessment = require('../../../domain/models/Assessment');
const SkillReview = require('../../../domain/models/SkillReview');

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
    if(model.campaign) {
      data.attributes['code-campaign'] = model.campaign.code;
    }
  }

  serializeRelationships(model, data) {
    data.relationships = {};

    data.relationships.course = {
      data: {
        type: 'courses',
        id: model.courseId,
      },
    };

    if (model.answers) {
      data.relationships.answers = {
        data: [],
      };
      for (const answer of model.answers) {
        data.relationships.answers.data.push({
          'type': 'answers',
          'id': answer.id,
        });
      }
    }

    // XXX - to link smart placement assessment to the associated skill-review
    // which exists only on smartPlacementAssessment
    if (model.type === Assessment.types.SMARTPLACEMENT) {
      data.relationships['skill-review'] = {
        data: {
          type: 'skill-reviews',
          id: SkillReview.generateIdFromAssessmentId(model.id),
        }
      };
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
          'nb-challenges': course.nbChallenges.toString(),
        },
      };
    }
  }

  deserialize(json) {
    let courseId;
    if (json.data.attributes.type === 'SMART_PLACEMENT') {
      courseId = null;
    } else {
      courseId = json.data.relationships.course.data.id;
    }
    return Assessment.fromAttributes({
      id: json.data.id,
      type: json.data.attributes.type,
      courseId,
    });
  }
}

module.exports = new AssessmentSerializer();
