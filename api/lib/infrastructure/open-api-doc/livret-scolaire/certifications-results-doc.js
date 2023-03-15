import Joi from 'joi';

import { certificationDoc } from './certification-doc.js';
import { competenceDoc } from './competence-doc.js';

const joiObject = Joi.object({
  certifications: certificationDoc,
  competences: competenceDoc,
}).label('CertificationsResults');

export { joiObject as certificationsResultsDoc };
