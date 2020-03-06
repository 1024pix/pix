import { JSONAPISerializer } from 'ember-cli-mirage';

const relationshipsToInclude = ['campaignCompetenceCollectiveResults', 'campaignTubeCollectiveResults'];

export default JSONAPISerializer.extend({
  include: relationshipsToInclude
});
