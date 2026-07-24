import { CombinedCourseBlueprintForCreation } from './CombinedCourseBlueprintForCreation.js';
import { QuestInput } from './QuestInput.js';

export class AdminCombinedCourseBlueprintDetails extends CombinedCourseBlueprintForCreation {
  constructor({ content, rewardRequirements = [], ...rest }) {
    super(rest);
    this.content = content;
    this.rewardRequirements = rewardRequirements;
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
