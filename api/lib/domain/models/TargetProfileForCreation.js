const { validate } = require('../validators/target-profile/creation-validation');
const TargetProfile = require('./TargetProfile');
const DEFAULT_IMAGE_URL = 'https://images.pix.fr/profil-cible/Illu_GEN.svg';

class TargetProfileForCreation {
  constructor({
    name,
    category = TargetProfile.categories.OTHER,
    skillIds,
    description,
    comment,
    isPublic,
    imageUrl = DEFAULT_IMAGE_URL,
    ownerOrganizationId,
  }) {
    this.name = name;
    this.category = category;
    this.skillIds = skillIds;
    this.description = description;
    this.comment = comment;
    this.isPublic = isPublic;
    this.imageUrl = imageUrl;
    this.ownerOrganizationId = ownerOrganizationId;
    validate(this);
  }
}

module.exports = TargetProfileForCreation;
