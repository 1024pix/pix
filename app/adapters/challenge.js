import AirtableAdapter from "ember-airtable/adapter";

export default AirtableAdapter.extend({

  pathForType: () => 'Epreuves',

  namespace: 'v0/appHAIFk9u1qqglhX',

  headers: {
    'Accept': 'application/json',
    'Authorization': 'Bearer keyEgu8JYhXaOhjbd'
  }
});
