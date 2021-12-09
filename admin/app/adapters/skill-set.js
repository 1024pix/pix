import ApplicationAdapter from './application';

export default class SkillSetAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  urlForCreateRecord(_modelName, skillSet) {
    return `${this.host}/${this.namespace}/badges/${skillSet.belongsTo('badge').id}/skill-sets`;
  }
}
