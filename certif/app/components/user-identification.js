import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class UserIdentification extends Component {
  /*
  * XXX Composant amené à disparaitre. Utilisé actuellement uniquement pour afficher le nom prénom de l'utilisateur
  * connecté
  * */
  @service currentUser;
}
