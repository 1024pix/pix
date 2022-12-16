import { JSONAPISerializer } from 'ember-cli-mirage';

const relationshipsToInclude = ['certificationCenter', 'user'];

export default JSONAPISerializer.extend({
  include: relationshipsToInclude,
});
