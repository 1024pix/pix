import { JSONAPISerializer } from 'ember-cli-mirage';

const _include = ['areas'];

export default JSONAPISerializer.extend({
  include: _include,
});
