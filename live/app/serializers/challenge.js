import DS from 'ember-data';

export default DS.JSONAPISerializer.extend({

  normalizeResponse(store, primaryModelClass, payload) {
    let challengeAttachments = payload.data.attributes.attachments;
    if (!challengeAttachments) {
      challengeAttachments = [];
    }
    return this._super(...arguments);
  }

});
