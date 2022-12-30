import { JSONAPISerializer } from 'ember-cli-mirage';

const _include = ['tubes'];

export default JSONAPISerializer.extend({
  include: _include,
});
