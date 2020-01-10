import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  currentUser: service(),
  pageTitle: 'Rejoindre une session de certification',
});
