import { JSONAPISerializer } from 'ember-cli-mirage';

let relationshipsToInclude = ['certificationCenter'];

export default JSONAPISerializer.extend({
  include: relationshipsToInclude
});
