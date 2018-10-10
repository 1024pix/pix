import { JSONAPISerializer } from 'ember-cli-mirage';

const relationshipsToInclude = ['assessment'];

export default JSONAPISerializer.extend({
  include: relationshipsToInclude
});
