import { TARGET_PROFILE_COPY_NAME_PREFIX } from '../../../src/shared/domain/constants.js';
import { validate } from '../validators/target-profile/creation-command-validation.js';

const DEFAULT_IMAGE_URL = 'https://images.pix.fr/profil-cible/Illu_GEN.svg';

class TargetProfileForCreation {
  constructor({
    name,
    category,
    description,
    comment,
    isPublic,
    imageUrl,
    ownerOrganizationId,
    tubes,
    areKnowledgeElementsResettable,
  }) {
    this.name = name;
    this.category = category;
    this.description = description;
    this.comment = comment;
    this.isPublic = isPublic;
    this.imageUrl = imageUrl;
    this.ownerOrganizationId = ownerOrganizationId;
    this.tubes = tubes;
    this.areKnowledgeElementsResettable = areKnowledgeElementsResettable;
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
      areKnowledgeElementsResettable: creationCommand.areKnowledgeElementsResettable,
    });
  }

  static copyTargetProfile(targetProfileToCopy) {
    const copiedTargetProfileName = TARGET_PROFILE_COPY_NAME_PREFIX + targetProfileToCopy.name;

    return new TargetProfileForCreation({
      name: copiedTargetProfileName,
      category: targetProfileToCopy.category,
      description: targetProfileToCopy.description,
      comment: targetProfileToCopy.comment,
      isPublic: targetProfileToCopy.isPublic,
      imageUrl: targetProfileToCopy.imageUrl || DEFAULT_IMAGE_URL,
      ownerOrganizationId: targetProfileToCopy.ownerOrganizationId,
      tubes: targetProfileToCopy.tubes,
      areKnowledgeElementsResettable: targetProfileToCopy.areKnowledgeElementsResettable,
    });
  }
}

export { TargetProfileForCreation };
