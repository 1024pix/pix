/**
 * Types of the Skill model, which is JavaScript.
 * To delete when Skill.js is converted to TypeScript.
 */
export type SkillFields = {
  id: string;
  name: string;
  pixValue: number;
  competenceId: string;
  tutorialIds: string[];
  learningMoreTutorialIds: string[];
  tubeId: string;
  version: number;
  difficulty: number;
  status: string;
  hintStatus: string;
  hint: string | null;
};

export class Skill {
  id: string;
  name: string;
  pixValue: number;
  competenceId: string;
  tutorialIds: string[];
  learningMoreTutorialIds: string[];
  tubeId: string;
  version: number;
  difficulty: number;
  status: string;
  hintStatus: string;
  hint: string | null;

  constructor(fields?: Partial<SkillFields>);

  get tubeName(): string;
  get tubeNameWithoutPrefix(): string;

  static areEqual(oneSkill?: Skill | null, otherSkill?: Skill | null): boolean;
  static areEqualById(oneSkill?: Skill | null, otherSkill?: Skill | null): boolean;
}
