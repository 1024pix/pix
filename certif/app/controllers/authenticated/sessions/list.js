import { action } from '@ember/object';
import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

const DEFAULT_PAGE_NUMBER = 1;

export default class ListController extends Controller {
  @tracked pageNumber = DEFAULT_PAGE_NUMBER;
  @tracked pageSize = 25;
  @service currentUser;

  get displayNoSessionPanel() {
    return !this.model.meta.hasSessions;
  }

  @action
  goToSessionDetails(sessionId) {
    this.transitionToRoute('authenticated.sessions.details', sessionId);
  }

  get shouldDisplayResultRecipientInfoMessage() {
    return !this.currentUser.currentCertificationCenter.isScoManagingStudents;
  }
}
