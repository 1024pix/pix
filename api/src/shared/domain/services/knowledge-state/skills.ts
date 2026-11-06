import { memoizeByReference } from '../../../infrastructure/utils/memoize.ts';
import { type Skill, type SkillStatus } from '../../models/Skill.js';

type PublishedSkillStatus = Extract<SkillStatus, 'actif' | 'archivé' | 'périmé'>;
type PublishedSkill = Skill & { status: PublishedSkillStatus };

// The published statuses of a skill, in the order a level keeps them. The
// other statuses are not released yet.
const PUBLISHED_STATUS_RANKS: Record<PublishedSkillStatus, number> = { actif: 0, archivé: 1, périmé: 2 };

const isPublished = (skill: Skill): skill is PublishedSkill => skill.status in PUBLISHED_STATUS_RANKS;

const statusRank = ({ status }: PublishedSkill): number => PUBLISHED_STATUS_RANKS[status];

// The views of the skills below are computed once per list of skills: the
// whole learning content is walked on every read and save of a user migrated
// to knowledge states, and the list the repository gives is shared and frozen.
// They are shared in turn: not to be changed by their callers.

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
export const keepOneSkillPerLevel = memoizeByReference((skills: Skill[]): Skill[] => {
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
});

export const groupSkillsByTubeId = memoizeByReference((skills: Skill[]): Map<string, Skill[]> =>
  Map.groupBy(skills, ({ tubeId }) => tubeId),
);

export const indexSkillsById = memoizeByReference(
  (skills: Skill[]): Map<string, Skill> => new Map(skills.map((skill) => [skill.id, skill])),
);

export const indexCompetenceIdsByTubeId = memoizeByReference(
  (skills: Skill[]): Map<string, string> => new Map(skills.map(({ tubeId, competenceId }) => [tubeId, competenceId])),
);
