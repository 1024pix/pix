const buildCampaignParticipation = require('./build-campaign-participation');
const buildUser = require('./build-user');

module.exports = (user, campaignParticipation) => {
  const { id: userId } = buildUser(user);
  return buildCampaignParticipation({ userId, ...campaignParticipation });
};

