import Inflector from 'ember-inflector';
import { JSONAPISerializer } from 'miragejs';

export default JSONAPISerializer.extend({
  typeKeyForModel(model) {
    return Inflector.inflector.pluralize(model.modelName);
  },
});
