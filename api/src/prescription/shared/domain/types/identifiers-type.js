import Joi from 'joi';

import { categories } from '../../../../shared/domain/models/TargetProfile.js';
import { certificabilityByLabel } from '../../application/helpers.js';

const filterType = {
  certificability: Joi.string().valid(...Object.keys(certificabilityByLabel)),
  targetProfileCategory: Joi.string().valid(...Object.values(categories)),
};

export { filterType };
