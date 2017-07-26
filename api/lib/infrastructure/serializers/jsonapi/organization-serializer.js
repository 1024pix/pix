const JSONAPISerializer = require('./jsonapi-serializer');
const Organization = require('../../../domain/models/data/organization');

class OrganizationSerializer extends JSONAPISerializer {

  constructor() {
    super('organizations');
  }

  serialize(modelObject) {
    const response = super.serialize(modelObject);

    response.included = [];
    response.included.push(this.serializeIncluded(modelObject.user));

    return response;
  }

  serializeAttributes(model, data) {
    data.attributes['name'] = model.name;
    data.attributes['type'] = model.type;
    data.attributes['email'] = model.email;
    data.attributes['code'] = model.code;
  }

  serializeRelationships(model, data) {
    data.relationships = {
      user: {
        data: { type: 'users', id: model.userId }
      }
    };
  }

  serializeIncluded(model) {
    let response = {};

    if(model.attributes) {
      response = {
        type: 'users',
        id: model.id,
        attributes: {
          email: model.attributes.email,
          'first-name': model.attributes.firstName,
          'last-name': model.attributes.lastName,
        }
      };
    }

    return response;
  }

  deserialize(json) {
    return new Organization({
      email: json.data.attributes.email,
      type: json.data.attributes.type,
      name: json.data.attributes.name,
    });
  }

}

module.exports = new OrganizationSerializer();
