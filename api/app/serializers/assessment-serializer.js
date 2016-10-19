'use strict';

const JSONAPISerializer = require('./jsonapi-serializer');
const Assessment = require('../models/data/assessment');

class AssessmentSerializer extends JSONAPISerializer {

  constructor() {
    super('assessments');
  }

  serializeAttributes(model, data) {
    data.attributes['user-id'] = model.userId;
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
    }
  }

  deserialize(json) {
    const assessment = new Assessment({
      id: json.data.id,
      courseId: json.data.relationships.course.data.id,
      userId: json.data.attributes["user-id"],
      userName: json.data.attributes["user-name"],
      userEmail: json.data.attributes["user-email"]
    });
    return assessment;
  }

}

module.exports = new AssessmentSerializer();
