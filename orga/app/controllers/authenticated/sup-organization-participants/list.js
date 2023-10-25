import { action } from '@ember/object';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class ListController extends Controller {
  @service router;
  @service store;
  @service currentUser;
  @service notifications;
  @service intl;
  @tracked search = null;
  @tracked studentNumber = null;
  @tracked groups = [];
  @tracked certificability = [];
  @tracked pageNumber = null;
  @tracked pageSize = 50;
  @tracked participationCountOrder = null;
  @tracked lastnameSort = 'asc';

  @action
  goToLearnerPage(learnerId, event) {
    event.preventDefault();
    this.router.transitionTo('authenticated.sup-organization-participants.sup-organization-participant', learnerId);
  }

  @action
  sortByParticipationCount(value) {
    this.participationCountOrder = value || null;
    this.pageNumber = null;
    this.lastnameSort = null;
  }

  @action
  sortByLastname(value) {
    this.lastnameSort = value || null;
    this.participationCountOrder = null;
    this.pageNumber = null;
  }

  @action
  triggerFiltering(fieldName, value) {
    this[fieldName] = value || undefined;
    this.pageNumber = null;
  }

  @action
  onResetFilter() {
    this.search = null;
    this.studentNumber = null;
    this.groups = [];
    this.certificability = [];
    this.pageNumber = null;
  }

  @action
  async deleteStudents(listLearners) {
    await this.store.adapterFor('sup-organization-participant').deleteParticipants(
      this.currentUser.organization.id,
      listLearners.map(({ id }) => id),
    );
    this.notifications.sendSuccess(
      this.intl.t('pages.sup-organization-participants.action-bar.success-message', {
        count: listLearners.length,
        firstname: listLearners[0].firstName,
        lastname: listLearners[0].lastName,
      }),
    );
    this.send('refreshModel');
  }
}
