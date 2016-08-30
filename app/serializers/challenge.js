import AirtableSerializer from "ember-airtable/serializer";

export default AirtableSerializer.extend({

  normalizeResponse(store, type, payload) {
    payload.fields.instruction = payload.fields['Consigne'];
    payload.fields.proposals = payload.fields['Propositions'];

    if (payload.fields['Illustration de la consigne']) {
      payload.fields.illustrationUrl = payload.fields['Illustration de la consigne'][0].url;
    }

    return this._super(...arguments);
  }

});
