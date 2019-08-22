import Component from '@ember/component';
import { equal } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Component.extend({

  currentUser: service(),

  isErrorMessage: equal('message', 'error'),

});
