// eslint-disable-next-line ember/no-mixins
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class JoinWhenAuthenticatedRoute extends Route.extend(AuthenticatedRouteMixin) {

  @service session;

  beforeModel(transition) {
    super.beforeModel(...arguments);

    const { queryParams } = transition.to;
    const alternativeRootURL = transition.router.generate('join', { queryParams });

    this.session.alternativeRootURL = alternativeRootURL;
    this.session.invalidate();
  }

}
