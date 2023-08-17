import ApplicationAdapter from './application';

export default class Assessment extends ApplicationAdapter {
  urlForUpdateRecord(...args) {
    const [, , snapshot] = args;
    const url = super.urlForUpdateRecord(...args);

    if (snapshot.adapterOptions?.completeAssessment) {
      delete snapshot.adapterOptions.completeAssessment;
      return url + '/complete-assessment';
    }

    if (snapshot.adapterOptions?.updateLastQuestionState) {
      delete snapshot.adapterOptions.updateLastQuestionState;
      return url + '/last-challenge-state/' + snapshot.attr('lastQuestionState');
    }

    return url;
  }

  pauseAssessment(assessmentId, challengeId) {
    const url = `${this.host}/${this.namespace}/assessments/${assessmentId}/pause`;
    const payload = { data: { data: { attributes: { 'challenge-id': challengeId } } } };
    return this.ajax(url, 'POST', payload);
  }
}
