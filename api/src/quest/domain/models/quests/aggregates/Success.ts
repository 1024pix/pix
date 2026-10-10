const KNOWLEDGE_ELEMENT_VALIDATED_STATUS = 'validated';

type SuccessKnowledgeElement = {
  status: string;
  skillId: string;
  createdAt?: Date;
};

type SuccessSkill = {
  id: string;
  tubeId: string;
  difficulty: number;
};

type CappedTube = {
  tubeId: string;
  level: number;
};

export type SuccessArgs = {
  knowledgeElements: SuccessKnowledgeElement[];
  campaignSkills?: SuccessSkill[];
  targetProfileSkills?: SuccessSkill[];
};

export class Success {
  knowledgeElements: SuccessKnowledgeElement[];
  campaignSkills: SuccessSkill[];
  targetProfileSkills: SuccessSkill[];

  constructor({ knowledgeElements, campaignSkills = [], targetProfileSkills = [] }: SuccessArgs) {
    this.knowledgeElements = knowledgeElements;
    this.campaignSkills = campaignSkills;
    this.targetProfileSkills = targetProfileSkills;
  }

  get skills(): SuccessSkill[] {
    const all = [...this.campaignSkills, ...this.targetProfileSkills];
    const seen = new Set<string>();
    return all.filter((skill) => {
      if (seen.has(skill.id)) return false;
      seen.add(skill.id);
      return true;
    });
  }

  getMasteryPercentageForSkills(skillIds: string[] | null): number {
    if (!skillIds?.length) {
      return 0;
    }
    const validatedSkillsCount = this.knowledgeElements.filter(
      (ke) => ke.status === KNOWLEDGE_ELEMENT_VALIDATED_STATUS && skillIds.includes(ke.skillId),
    ).length;
    return Math.round((validatedSkillsCount * 100) / skillIds.length);
  }

  getMasteryPercentageForCappedTubes(cappedTubes: CappedTube[] | null): number {
    if (!Array.isArray(cappedTubes)) {
      return 0;
    }
    const uniqCampaignSkills = this.skills;
    const sortedKEByDateDesc = this.knowledgeElements.toSorted(
      (keA, keB) => Number(keB.createdAt) - Number(keA.createdAt),
    );
    let total = 0;
    let validated = 0;
    for (const cappedTube of cappedTubes) {
      const skillsInTubeWithinMaxDifficulty = uniqCampaignSkills.filter(
        ({ tubeId, difficulty }) => tubeId === cappedTube.tubeId && difficulty <= cappedTube.level,
      );
      const skillsByDifficulty = Object.groupBy(skillsInTubeWithinMaxDifficulty, ({ difficulty }) => difficulty);
      for (const skills of Object.values(skillsByDifficulty)) {
        if (!skills) continue;
        ++total;
        const skillIds = skills.map(({ id }) => id);
        const ke = sortedKEByDateDesc.find(({ skillId }) => skillIds.includes(skillId));
        if (ke?.status === KNOWLEDGE_ELEMENT_VALIDATED_STATUS) {
          ++validated;
        }
      }
    }

    if (total === 0) return 0;

    return (validated / total) * 100;
  }
}
