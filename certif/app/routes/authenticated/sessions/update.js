import Route from '@ember/routing/route';
import moment from 'moment';

export default Route.extend({

  model(params) {
    return this.store.findRecord('session', params.session_id)
      .then((session) => {
        session.set('date', moment(session.get('date')).format('DD/MM/YYYY'));
        session.set('time', moment(session.get('time'), 'HH:mm:ss').format('HH:mm'));
        return session;
      });
  },

  deactivate: function () {
    this.controller.model.rollbackAttributes();
  },
});
