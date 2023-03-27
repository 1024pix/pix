import ApplicationSerializer from './application';

const relationshipsToInclude = ['campaignCompetenceCollectiveResults'];

export default ApplicationSerializer.extend({
  include: relationshipsToInclude,
});
