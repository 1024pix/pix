import AirtableSerializer from "./airtable-serializer";

export default AirtableSerializer.extend({

  transformFields(fields) {

    return {
      course: fields['Test'],
      answers: fields['Reponses'],
      userName: fields["Nom de l'usager"],
      userEmail: fields["Courriel de l'usager"]
    };
  },

  serializeIntoHash: function (data, type, record, options) {

    data['fields'] = this.serialize(record, options);
  },

  serialize: function (snapshot) {

    return {
      "Test": [
        snapshot.belongsTo('course', { id: true })
      ],
      "Nom de l'usager": snapshot.attr('userName'),
      "Courriel de l'usager": snapshot.attr('userEmail')
    };
  }
});
