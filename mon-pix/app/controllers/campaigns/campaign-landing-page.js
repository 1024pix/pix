import { action } from '@ember/object';
import { service } from '@ember/service';
import ENV from 'mon-pix/config/environment';
import UtmQueryParamsController from 'mon-pix/services/UtmQueryParamsController';

export default class CampaignLandingPageController extends UtmQueryParamsController {
  @service currentDomain;
  @service router;
  @service session;

  get shouldDisplayLocaleSwitcher() {
    return this.isInternationalDomain;
  }

  get isAutonomousCourse() {
    return this.model.organizationId === ENV.APP.AUTONOMOUS_COURSES_ORGANIZATION_ID;
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

  @action
  startCampaignParticipation() {
    return this.router.transitionTo('organizations.access', this.model.code);
  }
}
