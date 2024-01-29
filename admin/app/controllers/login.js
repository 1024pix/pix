import Controller from '@ember/controller';

export default class LoginController extends Controller {
  queryParams = ['userShouldCreateAnAccount', 'unknownErrorHasOccured', 'userShouldRequestAccess'];
}
