'use strict';

const JSONAPISerializer = require('./jsonapi-serializer');
const Assessment = require('../models/data/assessment');

class AssessmentSerializer extends JSONAPISerializer {

  constructor() {
    super('assessments');
  }

  serializeAttributes(model, data) {
    data.attributes['user-name'] = model.userName;
    data.attributes['user-email'] = model.userEmail;
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
      for (let answerId of model.answers) {
        data.relationships.answers.data.push({
          "type": 'answers',
          "id": answerId.id
        });
      }
    }

  }

  deserialize(json) {
    return new Assessment({
      id: json.data.id,
      courseId: json.data.relationships.course.data.id,
      userName: json.data.attributes["user-name"],
      userEmail: json.data.attributes["user-email"]
    });
  }

}

module.exports = new AssessmentSerializer();
