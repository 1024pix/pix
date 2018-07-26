import ModalRouteMixin from 'ember-routable-modal/mixins/route';
import RSVP from 'rsvp';
import BaseRoute from 'pix-live/routes/base-route';

export default BaseRoute.extend(ModalRouteMixin, {

  model(params) {
    const store = this.get('store');

    const answerId = params.answer_id;
    const index = params.index;

    const answer = store.findRecord('answer', answerId);

    return RSVP.hash({
      index,
      answer,
      correction: store.query('correction', { answerId }).then((corrections) => corrections.get('firstObject')),
      challenge: answer.then((foundAnswer) => store.findRecord('challenge', foundAnswer.get('challenge.id')))
    });
  }
});
