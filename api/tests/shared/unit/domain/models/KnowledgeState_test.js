import { KnowledgeState } from '../../../../../src/shared/domain/models/KnowledgeState.js';
import { Skill } from '../../../../../src/shared/domain/models/Skill.js';
import { expect } from '../../../../test-helper.js';

const buildSkill = ({ tube, level, competenceId = 'recCOMP1' }) =>
  new Skill({
    id: `skill_${tube}_${level}`,
    name: `@${tube}${level}`,
    difficulty: level,
    pixValue: 2,
    competenceId,
    tubeId: `tube_${tube}`,
  });

const referential = [
  ...[1, 2, 3, 4, 5].map((level) => buildSkill({ tube: 'web', level })),
  ...[1, 2, 3].map((level) => buildSkill({ tube: 'mail', level, competenceId: 'recCOMP2' })),
];

describe('Unit | Shared | Domain | Models | KnowledgeState', function () {
  const state = KnowledgeState.fromRows(
    [
      { tubeId: 'tube_web', floor: 2, ceiling: 4, directLevels: [2, 4], updatedAt: new Date('2026-01-10') },
      { tubeId: 'tube_mail', floor: 1, ceiling: null, directLevels: [1], updatedAt: new Date('2026-02-01') },
    ],
    { skills: referential },
  );

  it('déplie chaque acquis dans une des trois zones : validé, invalidé, inconnu', function () {
    expect(state.validatedSkills().map(({ id }) => id)).to.have.members(['skill_web_1', 'skill_web_2', 'skill_mail_1']);
    expect(state.invalidatedSkills().map(({ id }) => id)).to.have.members(['skill_web_4', 'skill_web_5']);
    expect(state.untestedSkills().map(({ id }) => id)).to.have.members(['skill_web_3', 'skill_mail_2', 'skill_mail_3']);
  });

  it('distingue les acquis réellement posés de ceux qui n ont été qu inférés', function () {
    const directlyAsked = buildSkill({ tube: 'web', level: 2 });
    const inferred = buildSkill({ tube: 'web', level: 1 });

    expect(state.isDirect(directlyAsked)).to.be.true;
    expect(state.isDirect(inferred)).to.be.false;
  });

  it('livre les verdicts directs, seule matière de l estimation de niveau', function () {
    expect(state.directVerdicts()).to.have.deep.members([
      { level: 2, isValidated: true },
      { level: 4, isValidated: false },
      { level: 1, isValidated: true },
    ]);
  });

  it('traite un tube inconnu comme vierge', function () {
    const elsewhere = new Skill({ id: 'autre', difficulty: 3, tubeId: 'tube_autre' });

    expect(state.isAssessed(elsewhere)).to.be.false;
    expect(state.boundsOf('tube_autre')).to.deep.include({ floor: 0, ceiling: Number.POSITIVE_INFINITY });
  });

  it('rattache un acquis sans tube à un tube qui n appartient qu à lui', function () {
    const orphan = new Skill({ id: 'recOrphan', difficulty: 2 });
    const stateWithOrphan = state.withAnswer({ skill: orphan, isOk: true });

    expect(stateWithOrphan.boundsOf('recOrphan').floor).to.equal(2);
  });

  describe('#restrictedToCompetence', function () {
    it('ne garde que les tubes de la compétence, lus dans son périmètre', function () {
      const competenceState = state.restrictedToCompetence('recCOMP2');

      expect(competenceState.tubeIds).to.deep.equal(['tube_mail']);
      expect(competenceState.validatedSkills().map(({ id }) => id)).to.deep.equal(['skill_mail_1']);
    });
  });

  describe('#restrictedToDate', function () {
    it('écarte les tubes qui ont bougé depuis la date : l état ne décrit que le présent', function () {
      const pastState = state.restrictedToDate(new Date('2026-01-15'));

      expect(pastState.tubeIds).to.deep.equal(['tube_web']);
    });
  });

  describe('#withAnswer', function () {
    it('fait monter le plancher sur une réussite, sans toucher l état de départ', function () {
      const after = state.withAnswer({ skill: buildSkill({ tube: 'mail', level: 3 }), isOk: true });

      expect(after.boundsOf('tube_mail')).to.deep.include({ floor: 3, directLevels: [1, 3] });
      expect(state.boundsOf('tube_mail').floor).to.equal(1);
    });

    it('fait descendre le plafond sur un échec', function () {
      const after = state.withAnswer({ skill: buildSkill({ tube: 'web', level: 3 }), isOk: false });

      expect(after.boundsOf('tube_web').ceiling).to.equal(3);
    });

    it('tranche en faveur de la validation quand la réponse contredit l état', function () {
      const after = state.withAnswer({ skill: buildSkill({ tube: 'web', level: 4 }), isOk: true });

      expect(after.boundsOf('tube_web')).to.deep.include({ floor: 4, ceiling: Number.POSITIVE_INFINITY });
    });

    it('hydrate le référentiel du tube répondu quand l état ne le connaissait pas', function () {
      const empty = new KnowledgeState();
      const tubeSkills = [1, 2, 3].map((level) => buildSkill({ tube: 'web', level }));

      const after = empty.withAnswer({ skill: tubeSkills[2], isOk: true, tubeSkills });

      expect(after.validatedSkills().map(({ id }) => id)).to.have.members([
        'skill_web_1',
        'skill_web_2',
        'skill_web_3',
      ]);
    });
  });

  describe('#withoutStaleFailures', function () {
    it('oublie les échecs assez anciens pour que les acquis redeviennent posables', function () {
      const improved = state.withoutStaleFailures({ since: new Date('2026-01-20'), minimumDelayInDays: 4 });

      expect(improved.boundsOf('tube_web')).to.deep.include({
        floor: 2,
        ceiling: Number.POSITIVE_INFINITY,
        directLevels: [2],
      });
    });

    it('garde les échecs trop récents pour être rejoués', function () {
      const improved = state.withoutStaleFailures({ since: new Date('2026-01-12'), minimumDelayInDays: 4 });

      expect(improved.boundsOf('tube_web').ceiling).to.equal(4);
    });

    it('fait disparaître un tube où il ne reste rien', function () {
      const onlyFailures = KnowledgeState.fromRows(
        [{ tubeId: 'tube_web', floor: 0, ceiling: 3, directLevels: [3], updatedAt: new Date('2026-01-01') }],
        { skills: referential },
      );

      const improved = onlyFailures.withoutStaleFailures({ since: new Date('2026-02-01'), minimumDelayInDays: 4 });

      expect(improved.isEmpty).to.be.true;
    });
  });

  describe('#withoutTubes', function () {
    it('oublie les tubes donnés, sans trace : remise à zéro', function () {
      const after = state.withoutTubes(['tube_web']);

      expect(after.tubeIds).to.deep.equal(['tube_mail']);
    });
  });

  it('se sérialise et se relit à l identique', function () {
    const rows = state.toRows();
    const reread = KnowledgeState.fromRows(rows, { skills: referential });

    expect(reread.toRows()).to.deep.equal(rows);
    expect(rows.find(({ tubeId }) => tubeId === 'tube_mail').ceiling).to.be.null;
  });

  it('donne la date du dernier mouvement, tous tubes confondus', function () {
    expect(state.lastMovedAt()).to.deep.equal(new Date('2026-02-01'));
  });
});
