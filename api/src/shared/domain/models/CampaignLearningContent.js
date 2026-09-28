import { LearningContent } from './LearningContent.js';

class CampaignLearningContent extends LearningContent {
  constructor(frameworks) {
    super(frameworks);
  }

  get areas() {
    return super.areas.toSorted((a, b) => a.code.localeCompare(b.code));
  }

  get competences() {
    return super.competences.toSorted((a, b) => a.index.localeCompare(b.index));
  }

  get skills() {
    return this.competences.flatMap((competence) => competence.skills.toSorted((a, b) => a.name.localeCompare(b.name)));
  }
}

export { CampaignLearningContent };
