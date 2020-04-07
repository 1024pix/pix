import classic from 'ember-classic-decorator';
import Controller from '@ember/controller';

@classic
export default class NotConnectedController extends Controller {
  pageTitle = 'Déconnecté';
}
