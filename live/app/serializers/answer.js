import AirtableSerializer from "./airtable-serializer";

export default AirtableSerializer.extend({

  transformFields(fields) {
    return {
      value: fields['Valeur'],
      challenge: fields['Epreuve'],
      assessment: fields['Evaluation']
    };
  },

  // FIXME: see how to move in AirtableSerializer
  serializeIntoHash: function (data, type, record, options) {
    data['fields'] = this.serialize(record, options);
  },

  serialize: function (snapshot) {
    return {
      "Valeur": snapshot.attr('value'),
      "Epreuve": [
        snapshot.belongsTo('challenge', { id: true })
      ],
      "Evaluation": [
        snapshot.belongsTo('assessment', { id: true })
      ]
    };
  }
});
