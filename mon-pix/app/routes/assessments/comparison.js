import ModalRouteMixin from 'ember-routable-modal/mixins/route';
import RSVP from 'rsvp';
import BaseRoute from 'mon-pix/routes/base-route';

export default BaseRoute.extend(ModalRouteMixin, {

  async model(params) {
    const store = this.get('store');

    const answerId = params.answer_id;
    const index = params.index;

    const answer = await store.findRecord('answer', answerId);
    const challenge = await answer.get('challenge');

    return RSVP.hash({
      index,
      answer,
      correction: store.query('correction', { answerId }).then((corrections) => corrections.get('firstObject')),
      challenge
    });
  }
});
