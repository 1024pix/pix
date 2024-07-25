import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer, Deserializer } = jsonapiSerializer;

import { Campaign } from '../../../../../shared/domain/models/Campaign.js';
import { CampaignParticipation } from '../../../domain/models/CampaignParticipation.js';

const serialize = function (campaignParticipation) {
  return new Serializer('campaign-participation', {
    transform: (campaignParticipation) => {
      const campaignParticipationForSerialization = new CampaignParticipation(campaignParticipation);
      if (campaignParticipation.lastAssessment) {
        campaignParticipationForSerialization.assessment = { id: campaignParticipation.lastAssessment.id };
      }
      campaignParticipationForSerialization.trainings = null;
      return campaignParticipationForSerialization;
    },

    attributes: [
      'isShared',
      'sharedAt',
      'createdAt',
      'participantExternalId',
      'campaign',
      'assessment',
      'deletedAt',
      'trainings',
    ],
    campaign: {
      ref: 'id',
      attributes: ['code', 'title', 'type'],
    },
    assessment: {
      ref: 'id',
      ignoreRelationshipData: true,
      relationshipLinks: {
        related(record) {
          return `/api/assessments/${record.assessment.id}`;
        },
      },
    },
    trainings: {
      ref: 'id',
      ignoreRelationshipData: true,
      relationshipLinks: {
        related(record, current, parent) {
          return `/api/campaign-participations/${parent.id}/trainings`;
        },
      },
    },
  }).serialize(campaignParticipation);
};

const deserialize = async function (json) {
  let campaign;
  const deserialize = new Deserializer({ keyForAttribute: 'camelCase' });
  const deserializedCampaignParticipation = await deserialize.deserialize(json);

  if (json.data?.relationships?.campaign) {
    campaign = new Campaign({ id: json.data.relationships.campaign.data.id });
  }

  const campaignParticipation = new CampaignParticipation({ ...deserializedCampaignParticipation, campaign });

  // does not want to pollute CampaignParticipation model
  if (json.data?.attributes['is-reset']) {
    campaignParticipation.isReset = deserializedCampaignParticipation.isReset;
  }

  return campaignParticipation;
};

export { deserialize, serialize };
