import ApplicationAdapter from './application';

export default class ElementAnswer extends ApplicationAdapter {
  urlForCreateRecord(modelName, { adapterOptions }) {
    return `${this.host}/${this.namespace}/modules/${adapterOptions.moduleSlug}/elements/${adapterOptions.elementId}/answers`;
  }
}
