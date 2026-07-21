import { pluralize } from '@warp-drive/utilities/string';
import { JSONAPISerializer } from 'miragejs';

export default JSONAPISerializer.extend({
  typeKeyForModel(model) {
    return pluralize(model.modelName);
  },
});
