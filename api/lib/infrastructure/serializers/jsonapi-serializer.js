class JSONAPISerializer {

  constructor(modelClassName) {
    this.modelClassName = modelClassName;
  }

  serialize(modelObject) {
    let response = {};
    response.data = this.serializeModelObject(modelObject);
    return response;
  }

  serializeArray(modelObjects) {
    let response = {};
    response.data = [];
    for (let modelObject of modelObjects) {
      response.data.push(this.serializeModelObject(modelObject));
    }
    return response;
  }

  serializeModelObject(modelObject) {
    const entity = modelObject.toJSON();
    let data = {};
    data.type = this.modelClassName;
    data.id = entity.id;
    data.attributes = {};
    this.serializeAttributes(entity, data);
    this.serializeRelationships(entity, data);
    return data;
  }

  serializeAttributes(model, data) {
  }

  serializeRelationships(model, data) {
  }

  deserialize(json) {
  }

}

module.exports = JSONAPISerializer;

