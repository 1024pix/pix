import { action } from '@ember/object';
import { service } from '@ember/service';
import UtmQueryParamsController from 'mon-pix/services/UtmQueryParamsController';

export default class CampaignLandingPageController extends UtmQueryParamsController {
  @service currentDomain;
  @service router;
  @service session;
  @service config;

  get shouldDisplayLocaleSwitcher() {
    return this.isInternationalDomain && this.isUserNotAuthenticated;
  }

  get isAutonomousCourse() {
    return this.model.organizationId === this.config.autonomousCoursesOrganizationId;
  }

  get isInternationalDomain() {
    return !this.currentDomain.isFranceDomain;
  }

  get isUserAuthenticatedByGAR() {
    return this.session.isAuthenticatedByGar;
  }

  get isUserAuthenticatedByPix() {
    return this.session.isAuthenticated;
  }

  get isUserNotAuthenticated() {
    return !this.isUserAuthenticatedByPix && !this.isUserAuthenticatedByGAR;
  }

  @action
  startCampaignParticipation() {
    return this.router.transitionTo('organizations.access', this.model.code);
  }
}
