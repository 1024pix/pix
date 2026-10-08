/**
 * Types of the KnowledgeElement model, which is JavaScript.
 * To delete when KnowledgeElement.js is converted to TypeScript.
 */
import { type Skill } from './Skill.js';

export type KnowledgeElementStatus = 'validated' | 'invalidated' | 'reset';

export type KnowledgeElementSource = 'direct' | 'inferred';

export type KnowledgeElementFields = {
  id?: number | null;
  createdAt?: Date | string;
  source: KnowledgeElementSource;
  status: KnowledgeElementStatus;
  earnedPix: number;
  answerId: number | null;
  assessmentId: number | null;
  skillId: string;
  userId: number;
  competenceId: string;
};

export class KnowledgeElement {
  static StatusType: { VALIDATED: 'validated'; INVALIDATED: 'invalidated'; RESET: 'reset' };
  static SourceType: { DIRECT: 'direct'; INFERRED: 'inferred' };

  id?: number | null;
  createdAt?: Date | string;
  source: KnowledgeElementSource;
  status: KnowledgeElementStatus;
  earnedPix: number;
  answerId: number | null;
  assessmentId: number | null;
  skillId: string;
  userId: number;
  competenceId: string;

  constructor(fields?: Partial<KnowledgeElementFields>);

  get isValidated(): boolean;
  get isInvalidated(): boolean;
  isDirectlyValidated(): boolean;

  static reset(knowledgeElement: KnowledgeElement): KnowledgeElement;

  static toLatestUniqNonResetCollection<Row extends Partial<KnowledgeElementFields>>(
    knowledgeElementRows: Row[],
  ): (KnowledgeElement & Row)[];

  static createKnowledgeElementsForAnswer(params: {
    answer: { id: number; assessmentId: number; isOk: () => boolean };
    challenge: { skill: Skill };
    previouslyFailedSkills: Skill[];
    previouslyValidatedSkills: Skill[];
    targetSkills: Skill[];
    userId: number;
  }): KnowledgeElement[];

  static computeDaysSinceLastKnowledgeElement(knowledgeElements: { createdAt?: Date | string }[]): number;
}
