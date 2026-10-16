import { type Skill, type SkillStatus } from '../../models/Skill.js';

type PublishedSkillStatus = Extract<SkillStatus, 'actif' | 'archivé' | 'périmé'>;
type PublishedSkill = Skill & { status: PublishedSkillStatus };

// The published statuses of a skill, in the order a level keeps them. The
// other statuses are not released yet.
const PUBLISHED_STATUS_RANKS: Record<PublishedSkillStatus, number> = { actif: 0, archivé: 1, périmé: 2 };

const isPublished = (skill: Skill): skill is PublishedSkill => skill.status in PUBLISHED_STATUS_RANKS;

const statusRank = ({ status }: PublishedSkill): number => PUBLISHED_STATUS_RANKS[status];

/**
 * Keeps one published skill per level of a tube.
 *
 * A knowledge state says that a level is validated, not which version of
 * its skill: without this choice, a level would count once per version in
 * the learning content. A level has at most one active skill, which is
 * kept. A level with none, retired by the content team, keeps its archived
 * skill, or failing that its expired one, the last published version first.
 * A level whose skills are not published yet is left out: no learner could
 * have answered it.
 */
export const keepOneSkillPerLevel = (skills: Skill[]): Skill[] => {
  const skillByLevel = new Map<string, Skill>();
  const byPreference = skills
    .filter(isPublished)
    .toSorted((skillA, skillB) => statusRank(skillA) - statusRank(skillB) || skillB.version - skillA.version);

  for (const skill of byPreference) {
    const level = `${skill.tubeId}|${skill.difficulty}`;
    if (!skillByLevel.has(level)) {
      skillByLevel.set(level, skill);
    }
  }

  return [...skillByLevel.values()];
};
