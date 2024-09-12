import ApplicationAdapter from './application';

export default class TrainingAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  async attachTargetProfile(options) {
    const { trainingId } = options;
    const payload = {
      'target-profile-ids': options.targetProfileIds,
    };

    const url = `${this.host}/${this.namespace}/trainings/${trainingId}/attach-target-profiles`;
    return this.ajax(url, 'POST', { data: payload });
  }
}
