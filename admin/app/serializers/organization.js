import JSONAPISerializer from '@ember-data/serializer/json-api';

export default JSONAPISerializer.extend({

  serialize(snapshot) {
    const json = this._super(...arguments);

    json.data.attributes['first-name'] = snapshot.record.get('firstName');
    json.data.attributes['last-name'] = snapshot.record.get('lastName');
    json.data.attributes['email'] = snapshot.record.get('email');
    json.data.attributes['password'] = snapshot.record.get('password');

    return json;
  },

});
