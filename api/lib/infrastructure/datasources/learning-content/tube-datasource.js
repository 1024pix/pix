import _ from 'lodash';
import datasource from './datasource';

export default datasource.extend({
  modelName: 'tubes',

  async findByNames(tubeNames) {
    const tubes = await this.list();
    return tubes.filter((tubeData) => _.includes(tubeNames, tubeData.name));
  },

  async findByRecordIds(tubeIds) {
    const tubes = await this.list();
    return tubes.filter(({ id }) => tubeIds.includes(id));
  },
});
