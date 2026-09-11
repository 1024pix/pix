import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class StudentScoController extends Controller {
  @service router;
  @service accessStorage;
  @service session;
  @service store;

  @action
  async reconcile(scoOrganizationLearner, adapterOptions) {
    const mustNotRedirectAfterSave = adapterOptions.withReconciliation === false;
    await scoOrganizationLearner.save({ adapterOptions });

    if (mustNotRedirectAfterSave) {
      return;
    }

    this.accessStorage.setAssociationDone(this.model.organizationToJoin.id);
    const verifiedCode = this.model.verifiedCode;

    if (verifiedCode.type === 'campaign') {
      this.router.transitionTo('campaigns.fill-in-participant-external-id', verifiedCode.id);
    } else {
      this.router.transitionTo('combined-courses.programme', verifiedCode.id);
    }
  }

  @action
  async goToConnectionPage() {
    this.session.set('skipRedirectAfterSessionInvalidation', true);
    await this.session.invalidate();
    this.accessStorage.setHasUserSeenJoinPage(this.model.organizationToJoin.id);
    this.router.transitionTo('organizations.access', this.model.verifiedCode.id);
  }
}
