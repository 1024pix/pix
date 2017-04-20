const JSONAPISerializer = require('./jsonapi-serializer');
const Assessment = require('../../../domain/models/data/assessment');

const faker = require('faker');
const _ = require('lodash');

function nonEmpty(string) {
  return _.isString(string) && string.length > 0;
}

class AssessmentSerializer extends JSONAPISerializer {

  constructor() {
    super('assessment');
  }

  serializeAttributes(model, data) {
    data.attributes['user-name'] = model.userName;
    data.attributes['user-email'] = model.userEmail;
    data.attributes['estimated-level'] = model.estimatedLevel;
    data.attributes['pix-score'] = model.pixScore;
    data.attributes['not-acquired-knowledge-tags'] = model.notAcquiredKnowledgeTags;
    data.attributes['acquired-knowledge-tags'] = model.acquiredKnowledgeTags;
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

    // XXX : use faker, waiting for authentication to come back one day
    if (!nonEmpty(json.data.attributes['user-name'])) {
      json.data.attributes['user-name'] = faker.internet.userName();
    }
    if (!nonEmpty(json.data.attributes['user-email'])) {
      json.data.attributes['user-email'] = faker.internet.email();
    }

    return new Assessment({
      id: json.data.id,
      courseId: json.data.relationships.course.data.id,
      userName: json.data.attributes['user-name'],
      userEmail: json.data.attributes['user-email']
    });
  }

}

module.exports = new AssessmentSerializer();
