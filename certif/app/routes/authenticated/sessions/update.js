import Route from '@ember/routing/route';
import moment from 'moment';

export default Route.extend({

  model({ session_id }) {
    return this.store.findRecord('session', session_id)
      .then((session) => {
        session.set('time', moment(session.get('time'), 'HH:mm:ss').format('HH:mm'));
        return session;
      });
  },

  deactivate: function() {
    this.controller.model.rollbackAttributes();
  },
});
