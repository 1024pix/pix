import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class InvitedRoute extends Route {
  @service accessStorage;
  @service session;
  @service router;
  @service store;

  buildRouteInfoMetadata() {
    return { doNotTrackPage: true };
  }

  beforeModel(transition) {
    this.session.requireAuthenticationAndApprovedTermsOfService(transition);
  }

  model() {
    return this.modelFor('organizations');
  }

  afterModel({ verifiedCode, organizationToJoin }) {
    const associationDone = this.accessStorage.isAssociationDone(organizationToJoin.id);

    if (this.shouldAssociateInformation(organizationToJoin, associationDone)) {
      this.router.replaceWith('organizations.invited.reconciliation', verifiedCode.id);
    } else if (this.shouldAssociateWithScoInformation(organizationToJoin, associationDone)) {
      this.router.replaceWith('organizations.invited.student-sco', verifiedCode.id);
    } else if (this.shouldAssociateWithSupInformation(organizationToJoin, associationDone)) {
      this.router.replaceWith('organizations.invited.student-sup', verifiedCode.id);
    } else if (verifiedCode.type === 'campaign') {
      this.router.replaceWith('campaigns.fill-in-participant-external-id', verifiedCode.id);
    } else {
      this.router.replaceWith('combined-courses.programme', verifiedCode.id);
    }
  }

  shouldAssociateInformation(organizationToJoin, associationDone) {
    return !associationDone && organizationToJoin.isReconciliationRequired;
  }

  shouldAssociateWithScoInformation(organizationToJoin, associationDone) {
    return organizationToJoin.type === 'SCO' && organizationToJoin.isRestricted && !associationDone;
  }

  shouldAssociateWithSupInformation(organizationToJoin, associationDone) {
    return organizationToJoin.type === 'SUP' && organizationToJoin.isRestricted && !associationDone;
  }
}
