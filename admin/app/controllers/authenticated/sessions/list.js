import Controller from '@ember/controller';

export default class ListController extends Controller {
  // v2
  get v2SessionsToBePublishedCount() {
    return this.model.v2SessionsToBePublished.length;
  }

  get v2SessionsWithRequiredActionCount() {
    return this.model.v2SessionsWithRequiredAction.length;
  }

  // v3
  get v3SessionsToBePublishedCount() {
    return this.model.v3SessionsToBePublished.length;
  }

  get v3SessionsWithRequiredActionCount() {
    return this.model.v3SessionsWithRequiredAction.length;
  }
}
