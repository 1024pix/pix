import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AssessmentsRoute extends Route {
  @service intl;

  model(params) {
    return this.store.findRecord('assessment', params.assessment_id);
  }

  afterModel(model) {
    if (model.isCertification) {
      model.title = this.intl.t('pages.challenge.certification.title', { certificationNumber: model.title });
    }
    return model;
  }
}
