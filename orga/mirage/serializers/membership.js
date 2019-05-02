import { JSONAPISerializer } from 'ember-cli-mirage';

const relationshipsToInclude = ['organization'];

export default JSONAPISerializer.extend({
  include: relationshipsToInclude
});
