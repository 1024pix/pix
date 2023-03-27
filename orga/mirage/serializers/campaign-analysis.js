import ApplicationSerializer from './application';

const relationshipsToInclude = ['campaignTubeRecommendations'];

export default ApplicationSerializer.extend({
  include: relationshipsToInclude,
});
