import Joi from 'joi';

import { certificabilityByLabel } from '../../application/helpers.js';

const filterType = {
  certificability: Joi.string().valid(...Object.keys(certificabilityByLabel)),
};

export { filterType };
