import Controller from '@ember/controller';

export default class ProfilesController extends Controller {
  queryParams = ['pageNumber', 'pageSize'];
  pageNumber = 1;
  pageSize = 10;
}
