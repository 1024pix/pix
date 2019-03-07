import RSVP from 'rsvp';
import BaseRoute from 'mon-pix/routes/base-route';
import { inject as service } from '@ember/service';

export default BaseRoute.extend({

  pixModalDialog: service(),

  beforeModel() {
    this.pixModalDialog.enableScrolling();
  },

  async model(params) {
    const store = this.get('store');

    const answerId = params.answer_id;

    const answer = await store.findRecord('answer', answerId);
    const challenge = await answer.get('challenge');

    return RSVP.hash({
      answer,
      correction: store.query('correction', { answerId }).then((corrections) => corrections.get('firstObject')),
      challenge
    });
  },

});
