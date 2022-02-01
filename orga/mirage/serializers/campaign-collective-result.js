import { JSONAPISerializer } from 'ember-cli-mirage';

const relationshipsToInclude = ['campaignCompetenceCollectiveResults'];

export default JSONAPISerializer.extend({
  include: relationshipsToInclude,
});
