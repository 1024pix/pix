import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
export default class ListController extends Controller {
  @tracked pageNumber = 1;
  @tracked pageSize = 25;
}
