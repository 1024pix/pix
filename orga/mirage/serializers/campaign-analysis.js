import { JSONAPISerializer } from 'ember-cli-mirage';

const relationshipsToInclude = ['campaignTubeRecommendations'];

export default JSONAPISerializer.extend({
  include: relationshipsToInclude
});
