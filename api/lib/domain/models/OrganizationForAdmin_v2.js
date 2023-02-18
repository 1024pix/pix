const Joi = require('joi');
const { EntityValidationError } = require('../errors');

class OrganizationForAdmin {
  constructor({
    id,
    name,
    type,
    isManagingStudents,
    credit,
    documentationUrl,
    createdBy,
    showNPS,
    showSkills,
    dataProtectionOfficerFirstName,
    dataProtectionOfficerLastName,
    dataProtectionOfficerEmail,
  }) {
    this._id = id;
    this._name = name;
    this._type = type;
    this._isManagingStudents = isManagingStudents;
    this._credit = credit;
    this._documentationUrl = documentationUrl;
    this._createdBy = createdBy;
    this._showNPS = showNPS;
    this._showSkills = showSkills;
    this._dataProtectionOfficerFirstName = dataProtectionOfficerFirstName;
    this._dataProtectionOfficerLastName = dataProtectionOfficerLastName;
    this._dataProtectionOfficerEmail = dataProtectionOfficerEmail;
  }

  static create(creationCommand) {
    const sanitizedCommand = sanitizeAndValidateCreationCommand(creationCommand);
    return new OrganizationForAdmin({
      id: undefined,
      name: sanitizedCommand.name,
      type: sanitizedCommand.type,
      documentationUrl: sanitizedCommand.documentationUrl,
      credit: sanitizedCommand.credit,
      dataProtectionOfficerFirstName: sanitizedCommand.dataProtectionOfficerFirstName,
      dataProtectionOfficerLastName: sanitizedCommand.dataProtectionOfficerLastName,
      dataProtectionOfficerEmail: sanitizedCommand.dataProtectionOfficerEmail,
      createdBy: sanitizedCommand.createdBy,
      isManagingStudents: false,
      showNPS: false,
      showSkills: false,
    });
  }

  toDTO() {
    return {
      id: this._id,
      name: this._name,
      type: this._type,
      documentationUrl: this._documentationUrl,
      credit: this._credit,
      dataProtectionOfficerFirstName: this._dataProtectionOfficerFirstName,
      dataProtectionOfficerLastName: this._dataProtectionOfficerLastName,
      dataProtectionOfficerEmail: this._dataProtectionOfficerEmail,
      createdBy: this._createdBy,
      isManagingStudents: this._isManagingStudents,
      showNPS: this._showNPS,
      showSkills: this._showSkills,
    };
  }
}

module.exports = OrganizationForAdmin;

function sanitizeAndValidateCreationCommand(creationCommand) {
  const schema = Joi.object({
    name: Joi.string().required().messages({
      'string.empty': 'Le nom de l’organisation doit être une chaîne de caractères.',
      'string.base': 'Le nom de l’organisation doit être une chaîne de caractères.',
    }),
    type: Joi.string().required().valid('SCO', 'SUP', 'PRO').messages({
      'any.only': 'Le type de l’organisation doit avoir l’une des valeurs suivantes: SCO, SUP, PRO.',
    }),
    documentationUrl: Joi.string().uri().allow('').messages({
      'string.uri': 'Le lien vers la documentation n’est pas valide.',
    }),
    credit: Joi.number().integer().min(0).messages({
      'number.base': 'Le nombre de crédits est optionnel. Si renseigné, il doit être positif ou nul.',
      'number.integer': 'Le nombre de crédits est optionnel. Si renseigné, il doit être positif ou nul.',
      'number.min': 'Le nombre de crédits est optionnel. Si renseigné, il doit être positif ou nul.',
    }),
    dataProtectionOfficerEmail: Joi.string().email().allow('').messages({
      'string.email': 'L’email fourni n’est pas valide.',
    }),
  });
  const sanitizedCommand = {
    name: creationCommand.name || '',
    type: creationCommand.type || '',
    documentationUrl: creationCommand.documentationUrl || '',
    credit: creationCommand.credit || 0,
    dataProtectionOfficerFirstName: creationCommand.dataProtectionOfficerFirstName || '',
    dataProtectionOfficerLastName: creationCommand.dataProtectionOfficerLastName || '',
    dataProtectionOfficerEmail: creationCommand.dataProtectionOfficerEmail || '',
    createdBy: creationCommand.createdBy,
  };
  const { error } = schema.validate(sanitizedCommand, {
    abortEarly: false,
    allowUnknown: true,
  });
  if (error) {
    throw EntityValidationError.fromJoiErrors(error.details);
  }
  return sanitizedCommand;
}
