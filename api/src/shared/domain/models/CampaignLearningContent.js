import { LearningContent } from './LearningContent.js';

class CampaignLearningContent extends LearningContent {
  // WHY: getters are called in hot loops (e.g. campaign CSV exports) and
  // sorting with localeCompare on every access blocks the event loop.
  // The learning content is not mutated after construction, so we compute once.
  #cache = new Map();

  constructor(frameworks) {
    super(frameworks);
  }

  get areas() {
    return this.#memoize('areas', () => super.areas.toSorted((a, b) => a.code.localeCompare(b.code)));
  }

  get competences() {
    return this.#memoize('competences', () => super.competences.toSorted((a, b) => a.index.localeCompare(b.index)));
  }

  get tubes() {
    return this.#memoize('tubes', () => super.tubes);
  }

  get skills() {
    return this.#memoize('skills', () =>
      this.competences.flatMap((competence) => competence.skills.toSorted((a, b) => a.name.localeCompare(b.name))),
    );
  }

  findCompetenceIdOfSkill(skillId) {
    const competenceIdBySkillId = this.#memoize('competenceIdBySkillId', () => {
      const competenceIdByTubeId = new Map(this.tubes.map((tube) => [tube.id, tube.competenceId]));
      return new Map(this.skills.map((skill) => [skill.id, competenceIdByTubeId.get(skill.tubeId) ?? null]));
    });
    return competenceIdBySkillId.get(skillId) ?? null;
  }

  #memoize(key, compute) {
    if (!this.#cache.has(key)) {
      this.#cache.set(key, compute());
    }
    return this.#cache.get(key);
  }
}

export { CampaignLearningContent };
