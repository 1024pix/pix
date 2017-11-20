const Bookshelf = require('../../../infrastructure/bookshelf');

class JSONAPISerializer {

  constructor(modelClassName) {
    this.modelClassName = modelClassName;
  }

  serialize(modelObject) {
    const response = {};
    response.data = this.serializeModelObject(modelObject);
    return response;
  }

  serializeArray(modelObjects) {
    const response = {};
    response.data = [];
    for (const modelObject of modelObjects) {
      response.data.push(this.serializeModelObject(modelObject));
    }
    return response;
  }

  serializeModelObject(modelObject) {
    if (!modelObject) {
      return null;
    }

    // XXX : Code temporaire pour gérer la sérialisation entre les models bookshelf et ceux "métier"
    const entity = (modelObject instanceof Bookshelf.Model) ? modelObject.toJSON() : modelObject;
    const data = {};
    data.type = this.modelClassName;

    if (entity.id) {
      data.id = entity.id;
    }

    data.attributes = {};
    this.serializeAttributes(entity, data);
    this.serializeRelationships(entity, data);
    this.serializeIncluded(entity, data);
    return data;
  }

  // eslint-disable-next-line no-unused-vars
  serializeAttributes(model, data) {
  }

  // eslint-disable-next-line no-unused-vars
  serializeRelationships(model, data) {
  }

  // eslint-disable-next-line no-unused-vars
  serializeIncluded(model, data) {
  }

  // eslint-disable-next-line no-unused-vars
  deserialize(json) {
  }

}

module.exports = JSONAPISerializer;

