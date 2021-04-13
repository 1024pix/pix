import { JSONAPISerializer } from 'ember-cli-mirage';
import Inflector from 'ember-inflector';

export default JSONAPISerializer.extend({
  typeKeyForModel(model) {
    return Inflector.inflector.singularize(model.modelName);
  },
});
