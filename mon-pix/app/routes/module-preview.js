import Route from '@ember/routing/route';
import { service } from '@ember/service';
import ENV from 'mon-pix/config/environment';

export default class ModulePreviewRoute extends Route {
  @service router;

  beforeModel() {
    if (!ENV.APP.ENABLE_MODULE_PREVIEW) {
      this.router.replaceWith('authenticated');
    }
  }
}
