import Controller from '@ember/controller';

export default class ListController extends Controller {
  get sessionsWithRequiredActionCount() {
    return this.model.length;
  }
}
