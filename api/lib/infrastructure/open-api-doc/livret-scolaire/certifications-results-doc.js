const Joi = require('joi');

const certificationDoc = require('./certification-doc');
const competenceDoc = require('./competence-doc');

module.exports = Joi.object({
  certifications: certificationDoc,
  competences: competenceDoc,
}).label('CertificationsResults');
