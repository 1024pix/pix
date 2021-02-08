import { JSONAPISerializer } from 'ember-cli-mirage';

const relationshipsToInclude = ['certification-center', 'user'];

export default JSONAPISerializer.extend({
  include: relationshipsToInclude,
});
