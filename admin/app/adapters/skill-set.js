import ApplicationAdapter from './application';

export default class SkillSetAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  urlForCreateRecord(_modelName, { adapterOptions: { badgeId } }) {
    return `${this.host}/${this.namespace}/badges/${badgeId}/skill-sets`;
  }
}
