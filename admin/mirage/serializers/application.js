import { pluralize } from '@ember-data/request-utils/string';
import { JSONAPISerializer } from 'miragejs';

export default JSONAPISerializer.extend({
  typeKeyForModel(model) {
    return pluralize(model.modelName);
  },
});
