import _ from 'lodash';
import { lcms } from '../../lcms.js';
import { LearningContentResourceNotFound } from './LearningContentResourceNotFound.js';
import { learningContentCache } from '../../caches/learning-content-cache.js';

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
    const learningContent = await learningContentCache.get(generator);
    return learningContent;
  },

  async refreshLearningContentCacheRecord(id, newEntry) {
    const currentLearningContent = await this._getLearningContent();
    const currentRecords = currentLearningContent[this.modelName];
    const updatedRecords = _.reject(currentRecords, { id }).concat([newEntry]);
    const newLearningContent = _.cloneDeep(currentLearningContent);
    newLearningContent[this.modelName] = updatedRecords;
    await learningContentCache.set(newLearningContent);
    return newEntry;
  },
};

const extend = function (props) {
  const result = Object.assign({}, _DatasourcePrototype, props);
  _.bindAll(result, _.functions(result));
  return result;
};

const refreshLearningContentCacheRecords = async function () {
  const learningContent = await lcms.getLatestRelease();
  await learningContentCache.set(learningContent);
  return learningContent;
};

export { extend, refreshLearningContentCacheRecords };
