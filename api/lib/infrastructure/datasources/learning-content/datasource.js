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
    const index = currentLearningContent[this.modelName].findIndex((element) => element?.id === id);
    if (index === -1) {
      currentLearningContent[this.modelName].push(newEntry);
    } else {
      currentLearningContent[this.modelName][index] = newEntry;
    }
    await learningContentCache.set(currentLearningContent);
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

const initLearningContent = _DatasourcePrototype._getLearningContent;

export { extend, refreshLearningContentCacheRecords, initLearningContent };
