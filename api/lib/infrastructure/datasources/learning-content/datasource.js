import _ from 'lodash';
import lcms from '../../lcms';
import LearningContentResourceNotFound from './LearningContentResourceNotFound';
import cache from '../../caches/learning-content-cache';

const _DatasourcePrototype = {
  async get(id) {
    const modelObjects = await this.list();
    const foundObject = _.find(modelObjects, { id });

    if (!foundObject) {
      throw new LearningContentResourceNotFound();
    }

    return foundObject;
  },

  async getMany(ids) {
    const modelObjects = await this.list();

    return ids.map((id) => {
      const foundObject = _.find(modelObjects, { id });

      if (!foundObject) {
        throw new LearningContentResourceNotFound();
      }

      return foundObject;
    });
  },

  async list() {
    const learningContent = await this._getLearningContent();
    return learningContent[this.modelName];
  },

  async _getLearningContent() {
    const generator = () => lcms.getLatestRelease();
    const learningContent = await cache.get(generator);
    return learningContent;
  },

  async refreshLearningContentCacheRecord(id, newEntry) {
    const currentLearningContent = await this._getLearningContent();
    const currentRecords = currentLearningContent[this.modelName];
    const updatedRecords = _.reject(currentRecords, { id }).concat([newEntry]);
    const newLearningContent = _.cloneDeep(currentLearningContent);
    newLearningContent[this.modelName] = updatedRecords;
    await cache.set(newLearningContent);
    return newEntry;
  },
};

export default {
  extend(props) {
    const result = Object.assign({}, _DatasourcePrototype, props);
    _.bindAll(result, _.functions(result));
    return result;
  },

  async refreshLearningContentCacheRecords() {
    const learningContent = await lcms.getLatestRelease();
    await cache.set(learningContent);
    return learningContent;
  },
};
