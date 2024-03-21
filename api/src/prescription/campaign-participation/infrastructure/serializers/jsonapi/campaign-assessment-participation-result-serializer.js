import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (campaignAssessmentParticipationResult) {
  return new Serializer('campaign-assessment-participation-results', {
    id: 'campaignParticipationId',
    attributes: ['campaignId', 'competenceResults'],
    typeForAttribute: (attribute) => {
      if (attribute === 'competenceResults') return 'campaign-assessment-participation-competence-results';
    },
    competenceResults: {
      ref: 'id',
      attributes: ['name', 'index', 'areaColor', 'competenceMasteryRate'],
    },
  }).serialize(campaignAssessmentParticipationResult);
};

export { serialize };
