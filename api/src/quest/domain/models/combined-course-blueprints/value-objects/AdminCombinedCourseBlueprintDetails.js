import { CombinedCourseBlueprintForCreation } from './CombinedCourseBlueprintForCreation.js';
import { QuestInput } from './QuestInput.js';

export class AdminCombinedCourseBlueprintDetails extends CombinedCourseBlueprintForCreation {
  constructor({ id, attestationLabel, rewardRequirements = [], organizationIds = [], createdAt, updatedAt, ...rest }) {
    super(rest);
    this.id = id;
    this.attestationLabel = attestationLabel;
    this.rewardRequirements = rewardRequirements;
    this.organizationIds = organizationIds;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static buildFromBlueprint({ combinedCourseBlueprint, modulesById, rewardRequirements = [], attestationLabel }) {
    const items = QuestInput.itemsFromQuest({ quest: combinedCourseBlueprint.quest, modulesById });
    return new AdminCombinedCourseBlueprintDetails({
      ...combinedCourseBlueprint,
      content: items,
      rewardRequirements,
      attestationLabel,
    });
  }
}
