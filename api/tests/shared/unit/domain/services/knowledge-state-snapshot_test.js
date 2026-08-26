import { KnowledgeState } from '../../../../../src/shared/domain/models/KnowledgeState.js';
import { Skill } from '../../../../../src/shared/domain/models/Skill.js';
import {
  deserializeSnapshot,
  serializeKnowledgeState,
} from '../../../../../src/shared/domain/services/knowledge-state-snapshot.js';
import { expect } from '../../../../test-helper.js';

const COMPETENCE_ID = 'recCOMP1';

const buildSkill = ({ tube, level }) =>
  new Skill({
    id: `skill_${tube}_${level}`,
    name: `@${tube}${level}`,
    difficulty: level,
    pixValue: 2,
    competenceId: COMPETENCE_ID,
    tubeId: `tube_${tube}`,
  });

const allSkills = [
  ...[1, 2, 3, 4, 5].map((level) => buildSkill({ tube: 'plein', level })),
  ...[1, 3, 6].map((level) => buildSkill({ tube: 'troue', level })),
];

describe('Unit | Shared | Domain | Services | knowledge-state-snapshot', function () {
  const knowledgeState = KnowledgeState.fromRows(
    [{ tubeId: 'tube_plein', floor: 3, ceiling: 5, directLevels: [3, 5], updatedAt: new Date('2026-01-03') }],
    { skills: allSkills },
  );

  it('rend le même état après sérialisation et relecture', function () {
    const snapshot = serializeKnowledgeState(knowledgeState);

    const reread = deserializeSnapshot({ snapshot, allSkills });

    expect(reread.toRows()).to.deep.equal(knowledgeState.toRows());
  });

  it('embarque la compétence et la date de chaque tube : l instantané doit rester lisible seul', function () {
    const snapshot = serializeKnowledgeState(knowledgeState);

    expect(snapshot.version).to.equal(2);
    expect(snapshot.tubes.tube_plein).to.deep.include({
      floor: 3,
      ceiling: 5,
      competenceId: COMPETENCE_ID,
      createdAt: new Date('2026-01-03'),
    });
    expect(snapshot.tubes.tube_plein.directLevels).to.deep.equal([3, 5]);
  });

  describe('relecture des instantanés au format historique — une entrée par acquis', function () {
    it('replie les knowledge elements en état par tube', function () {
      const legacy = [
        { skillId: 'skill_plein_1', status: 'validated', source: 'inferred', createdAt: '2026-01-01T00:00:00.000Z' },
        { skillId: 'skill_plein_3', status: 'validated', source: 'direct', createdAt: '2026-01-02T00:00:00.000Z' },
        { skillId: 'skill_plein_5', status: 'invalidated', source: 'direct', createdAt: '2026-01-03T00:00:00.000Z' },
      ];

      const reread = deserializeSnapshot({ snapshot: legacy, allSkills });

      expect(reread.boundsOf('tube_plein')).to.deep.include({ floor: 3, ceiling: 5, directLevels: [3, 5] });
      expect(reread.boundsOf('tube_plein').updatedAt).to.deep.equal(new Date('2026-01-03T00:00:00Z'));
    });

    it('ignore les acquis disparus du référentiel plutôt que de les situer au hasard', function () {
      const legacy = [{ skillId: 'skill_disparu', status: 'validated', source: 'direct', createdAt: '2026-01-01' }];

      const reread = deserializeSnapshot({ snapshot: legacy, allSkills });

      expect(reread.isEmpty).to.be.true;
    });

    it('tranche en faveur de la validation quand deux parcours se contredisent', function () {
      const legacy = [
        { skillId: 'skill_plein_4', status: 'validated', source: 'direct', createdAt: '2026-01-01' },
        { skillId: 'skill_plein_2', status: 'invalidated', source: 'direct', createdAt: '2026-01-02' },
      ];

      const reread = deserializeSnapshot({ snapshot: legacy, allSkills });

      expect(reread.boundsOf('tube_plein').floor).to.equal(4);
      expect(reread.boundsOf('tube_plein').ceiling).to.equal(Number.POSITIVE_INFINITY);
    });

    it('respecte les trous de niveaux du référentiel au dépliage', function () {
      const legacy = [{ skillId: 'skill_troue_3', status: 'validated', source: 'direct', createdAt: '2026-01-01' }];

      const reread = deserializeSnapshot({ snapshot: legacy, allSkills });

      // le tube n'a pas de niveau 2 : seuls les niveaux 1 et 3 existent sous le plancher
      expect(reread.validatedSkills().map(({ id }) => id)).to.have.members(['skill_troue_1', 'skill_troue_3']);
    });
  });
});
