import ApplicationAdapter from './application';

export default class TrainingAdapter extends ApplicationAdapter {
  async attachTargetProfile(options) {
    const { trainingId } = options;
    const payload = {
      'target-profile-ids': options.targetProfileIds,
    };

    const url = `${this.host}/${this.namespace}/trainings/${trainingId}/attach-target-profiles`;
    return this.ajax(url, 'POST', { data: payload });
  }

  async detachTargetProfile(options) {
    const { targetProfileId, trainingId } = options;

    const url = `${this.host}/${this.namespace}/trainings/${trainingId}/target-profiles/${targetProfileId}`;
    return this.ajax(url, 'DELETE');
  }

  async duplicate(trainingId) {
    const url = `${this.host}/${this.namespace}/trainings/${trainingId}/duplicate`;
    return this.ajax(url, 'POST');
  }
}
