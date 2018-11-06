import { JSONAPISerializer } from 'ember-cli-mirage';

let relationshipsToInclude = ['organization'];

export default JSONAPISerializer.extend({
  include: relationshipsToInclude
});
