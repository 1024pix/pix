const JSONAPISerializer = require('./jsonapi-serializer');

class courseGroupSerializer extends JSONAPISerializer {

  constructor() {
    super('course-group');
  }

  serialize(modelObject) {
    const response = super.serialize(modelObject);
    response.included = [];
    if (modelObject.courses) {
      for (const course of modelObject.courses) {
        response.included.push(this.serializeIncluded(course));
      }
    }

    return response;
  }

  serializeArray(modelObjects) {
    const response = {};
    response.data = [];
    response.included = [];
    for (const modelObject of modelObjects) {
      response.data.push(this.serializeModelObject(modelObject));

      if (modelObject.courses) {
        for (const course of modelObject.courses) {
          response.included.push(this.serializeIncluded(course));
        }
      }
    }
    return response;
  }

  serializeAttributes(model, serializedModel) {
    serializedModel.attributes['name'] = model.name;
  }

  serializeRelationships(model, serializedModel) {

    if (model.courses) {
      serializedModel.relationships = {
        courses: {
          data: []
        }
      };

      for (const course of model.courses) {
        serializedModel.relationships.courses.data.push({
          'id': course.id,
          'type': 'courses'
        });
      }
    }
  }

  serializeIncluded(course) {

    course.challenges = course.challenges || [];

    return {
      'type': 'courses',
      'id': course.id,
      attributes: {
        'name': course.name,
        'description': course.description,
        'image-url': course.imageUrl,
        'nb-challenges': course.challenges.length
      }
    };
  }

  deserialize() {
  }

}

module.exports = new courseGroupSerializer();
