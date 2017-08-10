const JSONAPISerializer = require('./jsonapi-serializer');

const _ = require('lodash');

class ProfileSerializer extends JSONAPISerializer {

  constructor() {
    super('user');
  }

  serialize(modelObject) {
    const response = {};
    response.data = this.serializeModelObject(modelObject);
    response.included = this.serializeIncluded(modelObject);
    return response;
  }

  serializeModelObject(modelObject) {
    if (!modelObject) {
      return null;
    }
    const entity = modelObject.user.toJSON();
    const competencesEntity = modelObject.competences;
    const organizationsEntity = modelObject.organizations;
    const data = {};
    data.type = 'users';
    data.id = entity.id;
    data.attributes = {};
    this.serializeAttributes(entity, data);
    this.serializeRelationships(competencesEntity, 'competences', data);
    this.serializeRelationships(organizationsEntity, 'organizations', data);
    return data;
  }

  serializeIncluded(model) {
    const included = [];
    this._serializeAreaIncluded(model, included);
    this._serializeCompetenceIncluded(model, included);
    this._serializeOrganizationIncluded(model, included);
    return included;
  }

  serializeAttributes(model, data) {
    data.attributes['first-name'] = model.firstName;
    data.attributes['last-name'] = model.lastName;
    data.attributes['email'] = model.email;

    if (!_.isUndefined(model['pix-score'])) {
      data.attributes['total-pix-score'] = model['pix-score'];
    }
  }

  serializeRelationships(model, modelName, data) {
    if (!data.relationships) {
      data.relationships = {};
    }

    if (model && !_.isEmpty(model)) {
      data.relationships[modelName] = {
        data: []
      };

      for (const modelItem of model) {
        data.relationships[modelName].data.push({
          'type': modelName,
          'id': modelItem.id
        });
      }
    }
  }

  _serializeCompetenceIncluded(model, included) {
    model.competences.forEach((competence) => {
      const competenceData = {
        'id': competence.id,
        'type': 'competences',
        attributes: {
          'name': competence.name,
          'index': competence.index,
          'level': competence.level,
          'course-id': competence.courseId
        },
        relationships: {
          'area': {
            'data': {
              'type': 'areas',
              'id': competence.areaId
            }
          }
        }
      };

      if (competence.level >= 0) {
        competenceData.attributes['pix-score'] = competence.pixScore;
      }

      included.push(competenceData);
    });
  }

  _serializeAreaIncluded(model, included) {
    for (const area of model.areas) {
      included.push({
        'id': area.id,
        'type': 'areas',
        attributes: {
          'name': area.name
        }
      });
    }
  }

  _serializeOrganizationIncluded(model, included) {
    for (const organization of model.organizations) {
      const organizationJson = organization.toJSON();
      included.push({
        'id': organizationJson.id,
        'type': 'organizations',
        attributes: {
          'name': organizationJson.name,
          'email': organizationJson.email,
          'type': organizationJson.type,
          'code': organizationJson.code
        }
      });
    }
  }

}

module.exports = new ProfileSerializer();
