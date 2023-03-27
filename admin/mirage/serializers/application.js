import { JSONAPISerializer } from 'miragejs';
import Inflector from 'ember-inflector';

export default JSONAPISerializer.extend({
  typeKeyForModel(model) {
    return Inflector.inflector.pluralize(model.modelName);
  },
});
