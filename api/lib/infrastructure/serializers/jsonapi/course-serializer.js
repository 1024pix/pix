const JSONAPISerializer = require('./jsonapi-serializer');

class CourseSerializer extends JSONAPISerializer {

  constructor() {
    super('course');
  }

  serializeAttributes(model, data) {
    data.attributes['name'] = model.name;
    data.attributes['description'] = model.description;
    data.attributes['duration'] = model.duration;
    data.attributes['is-adaptive'] = model.isAdaptive;

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
      for (const  challengeId of model.challenges) {
        data.relationships.challenges.data.push({
          'type': 'challenges',
          'id': challengeId
        });
      }
    }
  }

}

module.exports = new CourseSerializer();
