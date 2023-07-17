import Service, { inject as service } from '@ember/service';
import get from 'lodash/get';

const ALLOWED_ROUTES_FOR_ANONYMOUS_ACCESS = [
  'fill-in-campaign-code',
  'campaigns.assessment.tutorial',
  'campaigns.assessment.start-or-resume',
  'campaigns.campaign-landing-page',
  'campaigns.assessment.skill-review',
  'assessments.challenge',
  'assessments.checkpoint',
];

export default class Authentication extends Service {
  @service router;
  @service session;

  async handleAnonymousAuthentication(transition) {
    const isUserAnonymous = get(this.session, 'data.authenticated.authenticator') === 'authenticator:anonymous';

    if (!isUserAnonymous) {
      return;
    }

    const isRouteAccessNotAllowedForAnonymousUser = !ALLOWED_ROUTES_FOR_ANONYMOUS_ACCESS.includes(
      get(transition, 'to.name'),
    );

    if (isRouteAccessNotAllowedForAnonymousUser) {
      await this.session.invalidate();
      this.router.replaceWith('/campagnes');
    }
  }
}
