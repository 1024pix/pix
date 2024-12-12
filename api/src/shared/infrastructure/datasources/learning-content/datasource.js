import _ from 'lodash';

import { LearningContentCache } from '../../caches/learning-content-cache.js';
import { LearningContentResourceNotFound } from './LearningContentResourceNotFound.js';

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
    const learningContent = await LearningContentCache.instance.get();
    return learningContent[this.modelName];
  },
};

export function extend(props) {
  const result = Object.assign({}, _DatasourcePrototype, props);
  _.bindAll(result, _.functions(result));
  return result;
}
