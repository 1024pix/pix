import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class TrainingEditTriggersController extends Controller {
  queryParams = ['type'];

  @tracked type = null;
}
