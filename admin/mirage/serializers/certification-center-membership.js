import { JSONAPISerializer } from 'miragejs';

const relationshipsToInclude = ['certificationCenter', 'user'];

export default JSONAPISerializer.extend({
  include: relationshipsToInclude,
});
