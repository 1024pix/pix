import Controller from '@ember/controller';

export default class JoinController extends Controller {
  queryParams = ['code', 'invitationId'];
  code = null;
  invitationId = null;
}
