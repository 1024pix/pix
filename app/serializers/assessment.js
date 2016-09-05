import AirtableSerializer from "./airtable-serializer";

export default AirtableSerializer.extend({

  transformFields(fields) {
    return {
      name: fields['Nom'],
      course: fields['Test'],
      answers: fields['Reponses']
    };
  },

  serializeIntoHash: function (data, type, record, options) {
    data['fields'] = this.serialize(record, options);
  },

  serialize: function (snapshot) {
    return {
      "Test": [
        snapshot.belongsTo('course', { id: true })
      ]
    };
  }
});
