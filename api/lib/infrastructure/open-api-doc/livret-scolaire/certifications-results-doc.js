import Joi from 'joi';
import certificationDoc from './certification-doc';
import competenceDoc from './competence-doc';

export default Joi.object({
  certifications: certificationDoc,
  competences: competenceDoc,
}).label('CertificationsResults');
