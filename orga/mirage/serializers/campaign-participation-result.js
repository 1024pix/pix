import { JSONAPISerializer } from 'ember-cli-mirage';

const relationshipsToInclude = ['competenceResults'];

export default JSONAPISerializer.extend({
  include: relationshipsToInclude
});
