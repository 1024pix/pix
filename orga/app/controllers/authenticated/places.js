import Controller from '@ember/controller';
import { service } from '@ember/service';

export default class AuthenticatedPlacesController extends Controller {
  @service currentUser;
}
