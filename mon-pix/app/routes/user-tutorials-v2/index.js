import Route from '@ember/routing/route';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';
import { inject as service } from '@ember/service';

export default class IndexRoute extends Route.extend(SecuredRouteMixin) {
  @service featureToggles;

  redirect() {
    this.replaceWith(
      this.featureToggles.featureToggles.isNewTutorialsPageEnabled ? 'user-tutorials-v2.recommended' : 'user-tutorials'
    );
  }
}
