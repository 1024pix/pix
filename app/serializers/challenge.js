import AirtableSerializer from "./airtable-serializer";

export default AirtableSerializer.extend({
  transformFields(fields) {
    const res = {
      instruction: fields['Consigne'],
      proposals: fields['Propositions']
    };

    if (fields['Illustration de la consigne']) {
      res.illustrationUrl = fields['Illustration de la consigne'][0].url;
    }

    return res;
  }
});
