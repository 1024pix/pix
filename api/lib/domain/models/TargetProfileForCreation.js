const { validate } = require('../validators/target-profile/creation-command-validation.js');
const DEFAULT_IMAGE_URL = 'https://images.pix.fr/profil-cible/Illu_GEN.svg';

class TargetProfileForCreation {
  constructor({ name, category, description, comment, isPublic, imageUrl, ownerOrganizationId, tubes }) {
    this.name = name;
    this.category = category;
    this.description = description;
    this.comment = comment;
    this.isPublic = isPublic;
    this.imageUrl = imageUrl;
    this.ownerOrganizationId = ownerOrganizationId;
    this.tubes = tubes;
  }

  static fromCreationCommand(creationCommand) {
    validate(creationCommand);
    return new TargetProfileForCreation({
      name: creationCommand.name,
      category: creationCommand.category,
      description: creationCommand.description,
      comment: creationCommand.comment,
      isPublic: creationCommand.isPublic,
      imageUrl: creationCommand.imageUrl || DEFAULT_IMAGE_URL,
      ownerOrganizationId: creationCommand.ownerOrganizationId,
      tubes: creationCommand.tubes,
    });
  }
}

module.exports = TargetProfileForCreation;
