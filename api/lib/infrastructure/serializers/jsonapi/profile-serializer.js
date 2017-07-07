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

  serializeAttributes(model, data) {
    data.attributes['first-name'] = model.firstName;
    data.attributes['last-name'] = model.lastName;

    if (!_.isUndefined(model['pix-score']))
      data.attributes['total-pix-score'] = model['pix-score'];
  }

  serializeRelationships(model, modelName, data) {
    if (model) {
      data.relationships = {};
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
          'level': competence.level
        },
        relationships: {
          'area': {
            'type': 'areas',
            'id': competence.areaId
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

  serializeIncluded(model) {
    if (!model.competences || !model.areas) {
      return null;
    }

    const included = [];
    this._serializeAreaIncluded(model, included);
    this._serializeCompetenceIncluded(model, included);
    return included;
  }

  serializeModelObject(modelObject) {
    if (!modelObject) {
      return null;
    }
    const entity = modelObject.user.toJSON();
    const competencesEntity = modelObject.competences;
    const dataWrapper = [{}];
    const data = dataWrapper[0];
    data.type = this.modelClassName;
    data.id = entity.id;
    data.attributes = {};
    this.serializeAttributes(entity, data);
    this.serializeRelationships(competencesEntity, 'competences', data);
    return dataWrapper;
  }
}

module.exports = new ProfileSerializer();
