import ApplicationAdapter from './application';

export default class ModuleMetadata extends ApplicationAdapter {
  urlForFindAll() {
    return `${this.host}/${this.namespace}/modules-metadata`;
  }
}
