import { CombinedCourseBlueprintForCreation } from './CombinedCourseBlueprintForCreation.js';
import { QuestInput } from './QuestInput.js';

export class AdminCombinedCourseBlueprintDetails extends CombinedCourseBlueprintForCreation {
  constructor({ content, ...rest }) {
    super(rest);
    this.content = content;
  }

  static buildFromBlueprint({ combinedCourseBlueprint, modulesById, attestationLabel }) {
    const items = QuestInput.itemsFromQuest({ quest: combinedCourseBlueprint.quest, modulesById });
    return new AdminCombinedCourseBlueprintDetails({ ...combinedCourseBlueprint, content: items, attestationLabel });
  }
}
