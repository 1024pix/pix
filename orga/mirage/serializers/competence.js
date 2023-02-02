import { JSONAPISerializer } from 'ember-cli-mirage';

const _include = ['thematics'];

export default JSONAPISerializer.extend({
  include: _include,
});
