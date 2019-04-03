const JSONAPISerializer = require('./jsonapi-serializer');

const _ = require('lodash');

class ProfileSerializer extends JSONAPISerializer {

  constructor() {
    super('user');
  }

  serialize(modelObject) {
    const response = {};
    response.data = this._serializeModelObject(modelObject);
    response.included = this._serializeIncluded(modelObject);
    return response;
  }

  _serializeModelObject(modelObject) {
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
    this._serializeAttributes(entity, data);
    this._serializeRelationships(competencesEntity, 'competences', data);
    this._serializeRelationships(organizationsEntity, 'organizations', data);
    this._serializeCampaignParticipationsLink(data, entity);
    this._serializePixScoreLink(data, entity);
    this._serializeScorecardsLink(data, entity);
    return data;
  }

  _serializeCampaignParticipationsLink(data, entity) {
    data.relationships['campaign-participations'] = {
      links: {
        related: `/api/users/${entity.id}/campaign-participations`
      }
    };
  }

  _serializePixScoreLink(data, entity) {
    data.relationships['pix-score'] = {
      links: {
        related: `/api/users/${entity.id}/pixscore`
      }
    };
  }

  _serializeScorecardsLink(data, entity) {
    data.relationships['scorecards'] = {
      links: {
        related: `/api/users/${entity.id}/scorecards`
      }
    };
  }

  _serializeIncluded(model) {
    const included = [];
    this._serializeAreaIncluded(model, included);
    this._serializeCompetenceIncluded(model, included);
    this._serializeOrganizationIncluded(model, included);
    return included;
  }

  _serializeAttributes(model, data) {
    data.attributes['first-name'] = model.firstName;
    data.attributes['last-name'] = model.lastName;
    data.attributes['email'] = model.email;

    if (!_.isUndefined(model['pix-score'])) {
      data.attributes['total-pix-score'] = model['pix-score'];
    }
  }

  _serializeRelationships(model, modelName, data) {
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
          'description': competence.description,
          'course-id': competence.courseId,
          'status': competence.status,
          'assessment-id': null,
          'is-retryable': competence.isRetryable,
        },
        relationships: {
          'area': {
            'data': {
              'type': 'areas',
              'id': competence.area.id
            }
          }
        }
      };

      if (competence.level >= 0) {
        competenceData.attributes['pix-score'] = competence.pixScore;
      }

      if (competence.assessmentId) {
        competenceData.attributes['assessment-id'] = competence.assessmentId;
      }

      if (competence.daysBeforeNewAttempt) {
        competenceData.attributes['days-before-new-attempt'] = competence.daysBeforeNewAttempt;
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
      included.push({
        'id': organization.id,
        'type': 'organizations',
        attributes: {
          'name': organization.name,
          'type': organization.type,
          'code': organization.code
        },
        relationships: {
          snapshots: {
            links: {
              related: `/api/organizations/${organization.id}/snapshots`
            }
          }
        }
      });
    }
  }

}

module.exports = new ProfileSerializer();
