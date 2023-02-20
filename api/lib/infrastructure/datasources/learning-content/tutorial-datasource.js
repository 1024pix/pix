import _ from 'lodash';
import datasource from './datasource';

export default datasource.extend({
  modelName: 'tutorials',

  async findByRecordIds(tutorialRecordIds) {
    const tutorials = await this.list();
    return tutorials.filter((tutorialData) => _.includes(tutorialRecordIds, tutorialData.id));
  },
});
