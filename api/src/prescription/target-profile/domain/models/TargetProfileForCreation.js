import { validate } from '../../../../../lib/domain/validators/target-profile/creation-command-validation.js';
import { TARGET_PROFILE_COPY_NAME_PREFIX } from '../../../../shared/domain/constants.js';

const DEFAULT_IMAGE_URL = 'https://images.pix.fr/profil-cible/Illu_GEN.svg';

class TargetProfileForCreation {
  constructor({
    name,
    category,
    description,
    comment,
    imageUrl,
    ownerOrganizationId,
    tubes,
    areKnowledgeElementsResettable,
  }) {
    this.name = name;
    this.category = category;
    this.description = description;
    this.comment = comment;
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
      imageUrl: targetProfileToCopy.imageUrl || DEFAULT_IMAGE_URL,
      ownerOrganizationId: targetProfileToCopy.ownerOrganizationId,
      tubes: targetProfileToCopy.tubes,
      areKnowledgeElementsResettable: targetProfileToCopy.areKnowledgeElementsResettable,
    });
  }
}

export { TargetProfileForCreation };
