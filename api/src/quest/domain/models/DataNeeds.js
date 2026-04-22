export class DataNeeds {
  needsCampaignParticipations = false;
  needsPassages = false;
  moduleIds = [];
  needsKnowledgeElements = false;
  needsCampaignSkills = false;
  needsTargetProfileSkills = false;

  merge(other) {
    const merged = new DataNeeds();
    merged.needsCampaignParticipations = this.needsCampaignParticipations || other.needsCampaignParticipations;
    merged.needsPassages = this.needsPassages || other.needsPassages;
    merged.moduleIds = [...new Set([...this.moduleIds, ...other.moduleIds])];
    merged.needsKnowledgeElements = this.needsKnowledgeElements || other.needsKnowledgeElements;
    merged.needsCampaignSkills = this.needsCampaignSkills || other.needsCampaignSkills;
    merged.needsTargetProfileSkills = this.needsTargetProfileSkills || other.needsTargetProfileSkills;
    return merged;
  }
}
