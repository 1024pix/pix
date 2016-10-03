import Ember from 'ember';
import DS from 'ember-data';

const inflector = Ember.Inflector.inflector;

export default DS.RESTSerializer.extend({

  normalizeResponse(store, type, payload) {

    const modelNamePlural = inflector.pluralize(type.modelName);

    if (payload.records) {
      payload[modelNamePlural] = payload.records;
      delete payload.records;

      payload.meta = {
        offset: payload.offset
      };
      delete payload.offset;

      payload[modelNamePlural].forEach((record) => {
        record.fields = this.transformFields(record.fields);
        Ember.merge(record, record.fields);
        delete record.fields;
        record.created = record.createdTime;
        delete record.createdTime;
      });
    } else {
      payload.fields = this.transformFields(payload.fields);
      payload[type.modelName] = payload.fields;
      payload[type.modelName].id = payload.id;
      payload[type.modelName].created = payload.createdTime;
      delete payload.id;
      delete payload.fields;
      delete payload.createdTime;
    }

    return this._super(...arguments);
  },

  transformFields(fields) {
    return fields;
  }
});
