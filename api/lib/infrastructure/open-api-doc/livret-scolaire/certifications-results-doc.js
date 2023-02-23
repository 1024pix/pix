const Joi = require('joi');

const certificationDoc = require('./certification-doc.js');
const competenceDoc = require('./competence-doc.js');

module.exports = Joi.object({
  certifications: certificationDoc,
  competences: competenceDoc,
}).label('CertificationsResults');
