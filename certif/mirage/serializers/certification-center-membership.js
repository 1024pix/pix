import { JSONAPISerializer } from 'ember-cli-mirage';

const relationshipsToInclude = ['certificationCenter'];

export default JSONAPISerializer.extend({
  include: relationshipsToInclude
});
