import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class ProfilesController extends Controller {
  queryParams = ['pageNumber', 'pageSize'];
  @tracked pageNumber = 1;
  @tracked pageSize = 25;
}
