const usecases = require('../../domain/usecases');
const campaignRepository = require('../../infrastructure/repositories/campaign-repository');
const userRepository = require('../../infrastructure/repositories/user-repository');
const campaignSerializer = require('../../infrastructure/serializers/jsonapi/campaign-serializer');
const Campaign = require('../../domain/models/Campaign');

module.exports = {

  save(request, reply) {
    const userId = request.auth.credentials.userId;
    const deserializedCampaign = campaignSerializer.deserialize(request.payload);
    const campaign = new Campaign(deserializedCampaign);
    campaign.creatorId = userId;

    return usecases.createCampaign({ campaign, campaignRepository, userRepository })
      .then((createdCampaign) => {
        return reply(campaignSerializer.serialize(createdCampaign)).code(201);
      });
  }
};
