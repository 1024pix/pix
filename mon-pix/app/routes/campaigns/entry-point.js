import Route from '@ember/routing/route';
import { service } from '@ember/service';
import ENV from 'mon-pix/config/environment';
import Location from 'mon-pix/utils/location';

export default class EntryPoint extends Route {
  @service currentUser;
  @service currentDomain;
  @service campaignStorage;
  @service accessStorage;
  @service session;
  @service router;
  @service store;
  @service pixMetrics;

  buildRouteInfoMetadata() {
    return { doNotTrackPage: true };
  }

  async beforeModel() {
    if (this.session.isAuthenticated && this.currentUser.user.isAnonymous) {
      await this.session.invalidate();
    }
  }

  model() {
    return this.modelFor('campaigns');
  }

  async afterModel(campaign, transition) {
    this.accessStorage.clear(campaign.organizationId);
    this.campaignStorage.clear(campaign.code);
    // TODO: Change this when identity providers target apps are managed through the API
    if (campaign.identityProvider === 'FWB' && this.currentDomain.isFranceDomain && !this.currentDomain.isLocalhost) {
      const redirectUrl = this.currentDomain.convertUrlToOrgDomain();
      return Location.replace(redirectUrl);
    }

    const queryParams = transition.to.queryParams;
    if (queryParams.participantExternalId || queryParams.externalId) {
      const participantExternalId = queryParams.participantExternalId || queryParams.externalId;
      this.campaignStorage.set(campaign.code, 'participantExternalId', participantExternalId);
    }
    if (queryParams.retry) {
      this.pixMetrics.trackEvent('Clic sur Retenter la campagne', {
        disabled: true,
        category: 'Campagnes',
        action: 'Retenter la campagne',
      });
      this.campaignStorage.set(campaign.code, 'retry', transition.to.queryParams.retry);
    }
    if (queryParams.reset) {
      this.pixMetrics.trackEvent('Clic sur Remise à zéro de la campagne', {
        disabled: true,
        category: 'Campagnes',
        action: 'Remise à zéro de la campagne',
      });
      this.campaignStorage.set(campaign.code, 'reset', transition.to.queryParams.reset);
    }

    let hasParticipated = false;
    if (this.session.isAuthenticated) {
      const currentUserId = this.currentUser.user.id;
      const ongoingCampaignParticipation = await this.store.queryRecord('campaign-participation', {
        campaignId: campaign.id,
        userId: currentUserId,
      });
      hasParticipated = Boolean(ongoingCampaignParticipation);
      this.campaignStorage.set(campaign.code, 'hasParticipated', hasParticipated);
    }

    const isAutonomousCourse = campaign.organizationId === ENV.APP.AUTONOMOUS_COURSES_ORGANIZATION_ID;
    if (!campaign.isAccessible) {
      this.router.replaceWith('campaigns.archived-error', campaign.code);
    } else if (hasParticipated && !isAutonomousCourse) {
      this.router.replaceWith('campaigns.entrance', campaign.code);
    } else if (campaign.isPartOfCombinedCourse) {
      // Combined courses have their own presentation/onboarding: skip the campaign landing page
      // TODO quand l'onboarding sera dispo, rediriger plutôt vers l'onboarding
      //  à skip si le parcours combiné est déjà commencé (=/= participation à la campagne). Peut-être à gérer dans la page d'onboarding directement.
      //this.router.replaceWith('combined-courses.combined-course-landing-page', campaign.code);
      this.router.replaceWith('organizations.access', campaign.code);
    } else {
      this.router.replaceWith('campaigns.campaign-landing-page', campaign.code);
    }
  }
}
