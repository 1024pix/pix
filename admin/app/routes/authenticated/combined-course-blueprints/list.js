import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ListRoute extends Route {
  @service store;
  @service accessControl;

  beforeModel() {
    this.accessControl.restrictAccessTo(['isSuperAdmin', 'isMetier'], 'authenticated');
  }

  async model() {
    const blueprints = await this.store.findAll('combined-course-blueprint');
    return blueprints.slice().sort((a, b) => Number(b.id) - Number(a.id));
  }
}
