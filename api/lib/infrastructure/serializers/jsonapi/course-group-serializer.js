const JSONAPISerializer = require('./jsonapi-serializer');

class courseGroupSerializer extends JSONAPISerializer {

  constructor() {
    super('course-group');
  }

  serializeAttributes(model, data) {
    data.attributes['name'] = model.name;

  }

  serializeRelationships(model, data) {

    if (model.courses) {
      data.relationship = {
        courses: {
          data: []
        }
      };
      for (const course of model.courses) {
        data.relationship.courses.data.push({
          'id' : course.id,
          'type': 'course'
        });
      }
    }
  }

  serializeIncluded(model, data) {

    if (model.courses) {
      data.included = [];
      for (const course of model.courses) {
        data.included.push({
          'type' : 'course',
          'id' : course.id,
          attributes: {
            'name' : course.name,
            'description' : course.description,
            'imageUrl' : course.imageUrl
          }
        });
      }
    }

  }

  deserialize() {}

}

module.exports = new courseGroupSerializer();
