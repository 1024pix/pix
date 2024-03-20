import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class ModulePreviewController extends Controller {
  @service('store') store;

  @tracked module = '';
  @tracked errorMessage = null;

  get passage() {
    return this.store.createRecord('passage');
  }

  get formattedModule() {
    if (!this.module || this.module === '') {
      return { grains: [] };
    }
    const parsedModule = JSON.parse(this.module);
    return {
      ...parsedModule,
      grains: parsedModule.grains.map((grain) => ({
        ...grain,
        allElementsAreAnsweredForPassage: () => false,
      })),
    };
  }

  @action
  noop() {}

  @action
  updateModule(event) {
    try {
      this.errorMessage = null;
      const parsedModule = JSON.parse(event.target.value);
      if (!parsedModule.grains) {
        return;
      }
      this.module = JSON.stringify(parsedModule, null, 2);
    } catch (e) {
      this.errorMessage = e.message;
    }
  }
}
