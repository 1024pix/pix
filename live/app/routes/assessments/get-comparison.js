import ModalRouteMixin from 'ember-routable-modal/mixins/route';
import RSVP from 'rsvp';
import BaseRoute from 'pix-live/routes/base-route';


export default BaseRoute.extend(ModalRouteMixin, {

  model(params) {
    const store = this.get('store');

    const assessmentId = params.assessment_id;
    const answerId = params.answer_id;
    const index = params.index;

    return store.findRecord('answer', answerId).then((answer) => {
      return store.findRecord('challenge', answer.get('challenge.id')).then((challenge) => {
        return store.queryRecord('solution', {assessmentId, answerId}).then(function(solution) {
          return RSVP.hash({
            answer,
            challenge,
            solution,
            index
          });
        });
      });
    });

  },


});
