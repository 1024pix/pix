import AirtableSerializer from "ember-airtable/serializer";

export default AirtableSerializer.extend({

  normalizeResponse(store, type, payload) {
    payload.fields.instruction = payload.fields['Consigne'];
    payload.fields.proposals = payload.fields['Propositions'];
    return this._super(...arguments);
  }

});
