import ApplicationAdapter from './application';

export default class Assessment extends ApplicationAdapter {
  urlForUpdateRecord(id, modelName, { adapterOptions }) {
    const url = super.urlForUpdateRecord(...arguments);

    if (adapterOptions && adapterOptions.completeAssessment) {
      delete adapterOptions.completeAssessment;
      return url + '/complete-assessment';
    }

    if (adapterOptions && adapterOptions.updateLastQuestionsState) {
      const state = adapterOptions.state;
      delete adapterOptions.updateLastQuestionsState;
      delete adapterOptions.state;
      return url + '/last-challenge-state/' + state;
    }

    return url;
  }
}
