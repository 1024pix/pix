import AirtableSerializer from "./airtable-serializer";

export default AirtableSerializer.extend({
  transformFields(fields) {
    return {
      instruction: fields['Consigne'],
      proposals: fields['Propositions']
    }
  }
});
