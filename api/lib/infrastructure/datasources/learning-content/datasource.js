import _ from 'lodash';
import { lcms } from '../../lcms.js';
import { LearningContentResourceNotFound } from './LearningContentResourceNotFound.js';
import { LearningContentCache } from '../../caches/learning-content-cache.js';

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
    const learningContent = await LearningContentCache.instance.get(generator);
    return learningContent;
  },

  async refreshLearningContentCacheRecord(id, newEntry) {
    const currentLearningContent = await this._getLearningContent();

    const patch = this._generatePatch(currentLearningContent, id, newEntry);
    await LearningContentCache.instance.patch(patch);
    return newEntry;
  },

  _generatePatch(currentLearningContent, id, newEntry) {
    const index = currentLearningContent[this.modelName].findIndex((element) => element?.id === id);
    if (index === -1) {
      return {
        operation: 'push',
        path: this.modelName,
        value: newEntry,
      };
    }
    return {
      operation: 'assign',
      path: `${this.modelName}[${index}]`,
      value: newEntry,
    };
  },
};

const extend = function (props) {
  const result = Object.assign({}, _DatasourcePrototype, props);
  _.bindAll(result, _.functions(result));
  return result;
};

const refreshLearningContentCacheRecords = async function () {
  const learningContent = await lcms.getLatestRelease();
  await LearningContentCache.instance.set(learningContent);
  return learningContent;
};

export { extend, refreshLearningContentCacheRecords };
