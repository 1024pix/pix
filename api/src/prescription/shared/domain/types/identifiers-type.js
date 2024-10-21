import Joi from 'joi';

import { categories } from '../../../../shared/domain/models/TargetProfile.js';
import { certificabilityByLabel } from '../../application/helpers.js';

const identifiersType = {
  campaignCode: Joi.string().min(9).max(9).required(),
};

const filterType = {
  certificability: Joi.string().valid(...Object.keys(certificabilityByLabel)),
  targetProfileCategory: Joi.string().valid(...Object.values(categories)),
};

export { filterType, identifiersType };
