import Route from '@ember/routing/route';
import { service } from '@ember/service';
import get from 'lodash/get';

export default class AccessRoute extends Route {
  @service currentUser;
  @service session;
  @service campaignStorage;
  @service accessStorage;
  @service router;
  @service store;
  @service oidcIdentityProviders;

  buildRouteInfoMetadata() {
    return { doNotTrackPage: true };
  }

  async beforeModel(transition) {
    const { organizationToJoin, verifiedCode } = this.modelFor('organizations');
    const organizationToJoinIdentityProviderCode = organizationToJoin.identityProvider;
    const authenticatedIdentityProviderCode = get(this.session, 'data.authenticated.identityProviderCode');
    const organizationToJoinIdentityProvider = this.oidcIdentityProviders.findByCode(
      organizationToJoinIdentityProviderCode,
    );
    const identityProviderToVisit =
      authenticatedIdentityProviderCode != organizationToJoinIdentityProviderCode && organizationToJoinIdentityProvider;

    this.authenticationRoute = 'inscription';

    if (identityProviderToVisit) {
      this.session.setAttemptedTransition(transition);
      return this.router.replaceWith('authentication.oidc.login-flow', identityProviderToVisit.slug);
    } else if (this._shouldLoginToAccessSCORestrictedCampaign(organizationToJoin)) {
      this.authenticationRoute = 'organizations.join.student-sco';
    } else if (this._shouldJoinFromMediacentre(organizationToJoin)) {
      this.authenticationRoute = 'organizations.join.sco-mediacentre';
    } else if (await this._shouldJoinSimplifiedCampaignAsAnonymous(verifiedCode)) {
      this.authenticationRoute = 'organizations.join.anonymous';
    }
    this.session.requireAuthenticationAndApprovedTermsOfService(transition, this.authenticationRoute);
  }

  model() {
    return this.modelFor('organizations');
  }

  async afterModel({ verifiedCode }) {
    if (verifiedCode.type === 'campaign') {
      const campaign = await verifiedCode.campaign;
      const ongoingCampaignParticipation = await this.store.queryRecord('campaign-participation', {
        campaignId: campaign.id,
        userId: this.currentUser.user.id,
      });
      const hasParticipated = Boolean(ongoingCampaignParticipation);
      this.campaignStorage.set(campaign.code, 'hasParticipated', hasParticipated);

      if (hasParticipated) {
        this.router.replaceWith('campaigns.entrance', campaign.code);
      } else {
        this.router.replaceWith('organizations.invited', campaign.code);
      }
    } else {
      this.router.replaceWith('organizations.invited', verifiedCode.id);
    }
  }

  _shouldLoginToAccessSCORestrictedCampaign(organizationToJoin) {
    const isAuthenticatedByGar = this.session.isAuthenticatedByGar;
    const hasUserSeenJoinPage = this.accessStorage.hasUserSeenJoinPage(organizationToJoin.id);
    return (
      organizationToJoin.isRestricted &&
      organizationToJoin.type === 'SCO' &&
      /**  Two types of reconciliation exist : one with legacy import system and one with generic import feature.
       * Here, we want to use the legacy one for SCO users. In legacy import system, there are no reconciliation fields configuration (there are always the same).
       */
      !organizationToJoin.hasReconciliationFields &&
      !this.session.isAuthenticated &&
      (!isAuthenticatedByGar || hasUserSeenJoinPage)
    );
  }

  _shouldJoinFromMediacentre(organizationToJoin) {
    const isAuthenticatedByGar = this.session.isAuthenticatedByGar;
    return organizationToJoin.isRestricted && isAuthenticatedByGar;
  }

  async _shouldJoinSimplifiedCampaignAsAnonymous(verifiedCode) {
    if (verifiedCode.type !== 'campaign') return false;
    const campaign = await verifiedCode.campaign;

    return campaign.isSimplifiedAccess && !this.session.isAuthenticated;
  }
}
