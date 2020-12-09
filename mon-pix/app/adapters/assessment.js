import ApplicationAdapter from './application';

export default class Assessment extends ApplicationAdapter {
  urlForUpdateRecord(id, modelName, { adapterOptions }) {
    const url = super.urlForUpdateRecord(...arguments);

    if (adapterOptions && adapterOptions.completeAssessment) {
      delete adapterOptions.completeAssessment;
      return url + '/complete-assessment';
    }

    return url;
  }
}
