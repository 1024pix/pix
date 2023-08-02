import Controller from '@ember/controller';

export default class ListController extends Controller {
  get sessionsWithRequiredActionCount() {
    return this.model.v2Sessions.length;
  }

  get sessionsWithRequiredActionCountVersion3() {
    return this.model.v3Sessions.length;
  }
}
