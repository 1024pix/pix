import { JSONAPISerializer } from 'ember-cli-mirage';

const _include = ['competences'];

export default JSONAPISerializer.extend({
  include: _include,
});
