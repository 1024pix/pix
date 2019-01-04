import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
  classNames: ['profile-panel'],
  competences: null,
  totalPixScore: null,
  session: service(),
  showSharedButton: computed('session', function() {
    const session = this.get('session');
    return session.data.authenticated.source === 'pix';
  }),
});
