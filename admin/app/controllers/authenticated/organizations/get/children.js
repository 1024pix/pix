import Controller from '@ember/controller';
import { service } from '@ember/service';

export default class AuthenticatedOrganizationsGetChildrenController extends Controller {
  @service accessControl;
}
