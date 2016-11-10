'use strict';

const JSONAPISerializer = require('./jsonapi-serializer');

class CourseSerializer extends JSONAPISerializer {

  constructor() {
    super('courses');
  }

  serializeAttributes(model, data) {
    data.attributes["name"] = model.name;
    data.attributes["description"] = model.description;
    data.attributes["duration"] = model.duration;

    if (model.imageUrl) {
      data.attributes['image-url'] = model.imageUrl;
    }
  }

  serializeRelationships(model, data) {
    if (model.challenges) {
      data.relationships = {
        challenges: {
          data: []
        }
      };
      for (let challengeId of model.challenges) {
        data.relationships.challenges.data.unshift({
          "type": 'challenges',
          "id": challengeId
        });
      }
    }
  }

}

module.exports = new CourseSerializer();
