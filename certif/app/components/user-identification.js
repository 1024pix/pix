import Component from '@ember/component';

import { inject as service } from '@ember/service';

export default Component.extend({

  /*
  * XXX Composant amené à disparaitre. Utilisé actuellement uniquement pour afficher le nom prénom de l'utilisateur
  * connecté
  * */

  currentUser: service('current-user'),

});
