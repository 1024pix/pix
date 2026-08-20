import { KnowledgeState } from '../../../../../src/shared/domain/models/KnowledgeState.js';
import * as knowledgeStateRepository from '../../../../../src/shared/infrastructure/repositories/knowledge-state-repository.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import * as learningContentBuilder from '../../../../tooling/learning-content-builder/index.js';

const COMPETENCE_ID = 'recCOMP1';

/** Un tube de 5 niveaux, un tube à trou de niveaux, chacun avec ses questions. */
const buildLearningContent = () => {
  const skills = [
    ...[1, 2, 3, 4, 5].map((level) => skillOf({ tube: 'plein', level })),
    ...[1, 3, 6].map((level) => skillOf({ tube: 'troue', level })),
  ];

  databaseBuilder.factory.learningContent.build({
    skills,
    challenges: skills.map((skill) =>
      learningContentBuilder.buildChallenge({ id: `challenge_${skill.id}`, skillId: skill.id }),
    ),
  });

  return skills;
};

const skillOf = ({ tube, level }) =>
  learningContentBuilder.buildSkill({
    id: `skill_${tube}_${level}`,
    name: `@${tube}${level}`,
    level,
    pixValue: 2,
    competenceId: COMPETENCE_ID,
    tubeId: `tube_${tube}`,
    status: 'actif',
  });

/** Fait répondre l'utilisateur, ce qui enregistre la réponse et porte l'état. */
const answer = ({ userId, assessmentId, skillId, isOk, createdAt }) =>
  databaseBuilder.factory.buildAnsweredSkill({
    userId,
    assessmentId,
    skillId,
    challengeId: `challenge_${skillId}`,
    isOk,
    createdAt,
    withSkill: false,
    withChallenge: false,
  });

const validatedIds = (knowledgeState) =>
  knowledgeState
    .validatedSkills()
    .map(({ id }) => id)
    .toSorted();

describe('Integration | Evaluation | Repository | knowledge-state-repository', function () {
  describe('#findByUserId', function () {
    it('déplie un parcours simple exactement comme le modèle historique', async function () {
      // given
      buildLearningContent();
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: assessmentId } = databaseBuilder.factory.buildAssessment({ userId, competenceId: COMPETENCE_ID });

      answer({ userId, assessmentId, skillId: 'skill_plein_3', isOk: true, createdAt: new Date('2026-01-01') });
      answer({ userId, assessmentId, skillId: 'skill_plein_5', isOk: false, createdAt: new Date('2026-01-02') });
      await databaseBuilder.commit();

      // when
      const knowledgeState = await knowledgeStateRepository.findByUserId({ userId });

      // then
      expect(validatedIds(knowledgeState)).to.deep.equal(['skill_plein_1', 'skill_plein_2', 'skill_plein_3']);
      expect(knowledgeState.invalidatedSkills().map(({ id }) => id)).to.deep.equal(['skill_plein_5']);
      expect(knowledgeState.isDirect({ id: 'skill_plein_3', tubeId: 'tube_plein', difficulty: 3 })).to.be.true;
      expect(knowledgeState.isDirect({ id: 'skill_plein_2', tubeId: 'tube_plein', difficulty: 2 })).to.be.false;
      // La valeur d'un acquis se lit sur le référentiel courant.
      expect(knowledgeState.validatedSkills().every(({ pixValue }) => pixValue === 2)).to.be.true;
    });

    it('infère sur un tube à trou de niveaux comme le modèle actuel', async function () {
      // given
      buildLearningContent();
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: assessmentId } = databaseBuilder.factory.buildAssessment({ userId, competenceId: COMPETENCE_ID });

      // le tube 'troue' n'a pas de niveau 2 : réussir le 3 ne valide que le 1
      answer({ userId, assessmentId, skillId: 'skill_troue_3', isOk: true, createdAt: new Date('2026-01-01') });
      await databaseBuilder.commit();

      // when
      const knowledgeState = await knowledgeStateRepository.findByUserId({ userId });

      // then
      expect(validatedIds(knowledgeState)).to.deep.equal(['skill_troue_1', 'skill_troue_3']);
    });

    it('résout un conflit entre deux assessments en faveur de la validation', async function () {
      // given
      buildLearningContent();
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: firstAssessmentId } = databaseBuilder.factory.buildAssessment({
        userId,
        competenceId: COMPETENCE_ID,
      });
      const { id: secondAssessmentId } = databaseBuilder.factory.buildAssessment({
        userId,
        competenceId: COMPETENCE_ID,
      });

      answer({
        userId,
        assessmentId: firstAssessmentId,
        skillId: 'skill_plein_4',
        isOk: true,
        createdAt: new Date('2026-01-01'),
      });
      // La seconde réponse porte sur un acquis déjà couvert : elle reste sans effet
      answer({
        userId,
        assessmentId: secondAssessmentId,
        skillId: 'skill_plein_2',
        isOk: false,
        createdAt: new Date('2026-02-01'),
      });
      await databaseBuilder.commit();

      // when
      const knowledgeState = await knowledgeStateRepository.findByUserId({ userId });

      // then — l'acquis 2 reste validé, l'état n'est pas contredit
      expect(validatedIds(knowledgeState)).to.deep.equal([
        'skill_plein_1',
        'skill_plein_2',
        'skill_plein_3',
        'skill_plein_4',
      ]);
    });

    it('ne compte qu une fois un acquis dont le référentiel garde plusieurs versions', async function () {
      // given — le référentiel conserve la version passée d'un acquis : même tube,
      // même niveau, même nom, un identifiant différent.
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.learningContent.build({
        skills: [
          learningContentBuilder.buildSkill({
            id: 'outil1_v2',
            name: '@outil1',
            level: 1,
            version: 2,
            tubeId: 'tubeOutil',
            competenceId: COMPETENCE_ID,
            status: 'actif',
            pixValue: 4,
          }),
          learningContentBuilder.buildSkill({
            id: 'outil1_v1',
            name: '@outil1',
            level: 1,
            version: 1,
            tubeId: 'tubeOutil',
            competenceId: COMPETENCE_ID,
            status: 'archivé',
            pixValue: 4,
          }),
        ],
      });
      databaseBuilder.factory.buildKnowledgeState({
        userId,
        tubeId: 'tubeOutil',
        floor: 1,
        directLevels: [1],
      });
      await databaseBuilder.commit();

      // when
      const knowledgeState = await knowledgeStateRepository.findByUserId({ userId });

      // then — la version en vigueur, et elle seule.
      expect(knowledgeState.validatedSkills().map(({ id }) => id)).to.deep.equal(['outil1_v2']);
    });
  });

  describe('#save', function () {
    it('écrit une ligne par tube touché, là où le modèle historique en écrivait une par acquis', async function () {
      // given
      const [, , levelThree] = buildLearningContent();
      const { id: userId } = databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();

      // when — une réussite au niveau 3 vaut pour les niveaux 1 et 2 du tube
      const knowledgeState = new KnowledgeState().withAnswer({
        skill: { id: levelThree.id, tubeId: 'tube_plein', difficulty: 3 },
        isOk: true,
      });
      await knowledgeStateRepository.save({ userId, knowledgeState });

      // then
      const rows = await knex('knowledge-states').where({ userId });
      expect(rows).to.have.lengthOf(1);
      expect(rows[0]).to.include({ tubeId: 'tube_plein', floor: 3, ceiling: null });
      expect(rows[0].directLevels).to.deep.equal([3]);
    });

    it('resserre l état sans jamais le relâcher', async function () {
      // given
      buildLearningContent();
      const { id: userId } = databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();

      // when
      const first = (await knowledgeStateRepository.findByUserId({ userId })).withAnswer({
        skill: { id: 'skill_plein_3', tubeId: 'tube_plein', difficulty: 3 },
        isOk: true,
      });
      await knowledgeStateRepository.save({ userId, knowledgeState: first });
      const second = (await knowledgeStateRepository.findByUserId({ userId })).withAnswer({
        skill: { id: 'skill_plein_5', tubeId: 'tube_plein', difficulty: 5 },
        isOk: false,
      });
      await knowledgeStateRepository.save({ userId, knowledgeState: second });

      // then
      const [row] = await knex('knowledge-states').where({ userId });
      expect(row).to.include({ floor: 3, ceiling: 5 });
      expect(row.directLevels).to.deep.equal([3, 5]);

      const knowledgeState = await knowledgeStateRepository.findByUserId({ userId });
      expect(validatedIds(knowledgeState)).to.deep.equal(['skill_plein_1', 'skill_plein_2', 'skill_plein_3']);
      expect(knowledgeState.invalidatedSkills().map(({ id }) => id)).to.deep.equal(['skill_plein_5']);
    });
  });

  describe('état matérialisé et limitDate', function () {
    it('sert l état matérialisé quand la date demandée lui est postérieure, sans relire les réponses', async function () {
      // given — un utilisateur dont l'état est matérialisé et les réponses purgées,
      // ce qui est la situation d'un profil ancien au moment où il partage.
      buildLearningContent();
      const { id: userId } = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildKnowledgeState({
        userId,
        tubeId: 'tube_plein',
        floor: 3,
        directLevels: [3],
        updatedAt: new Date('2026-01-01'),
      });
      await databaseBuilder.commit();

      // when — aucune réponse en base : seul l'état peut répondre
      const knowledgeState = await knowledgeStateRepository.findByUserId({
        userId,
        limitDate: new Date('2026-06-01'),
      });

      // then
      expect(validatedIds(knowledgeState)).to.deep.equal(['skill_plein_1', 'skill_plein_2', 'skill_plein_3']);
    });

    it('écarte un tube qui a bougé depuis la date demandée', async function () {
      // given — deux tubes, dont un seul a bougé après la date interrogée.
      buildLearningContent();
      const { id: userId } = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildKnowledgeState({
        userId,
        tubeId: 'tube_plein',
        floor: 3,
        directLevels: [3],
        updatedAt: new Date('2026-05-01'),
      });
      databaseBuilder.factory.buildKnowledgeState({
        userId,
        tubeId: 'tube_troue',
        floor: 1,
        directLevels: [1],
        updatedAt: new Date('2026-01-01'),
      });
      await databaseBuilder.commit();

      // when
      const knowledgeState = await knowledgeStateRepository.findByUserId({
        userId,
        limitDate: new Date('2026-02-01'),
      });

      // then — l'état ne décrit que le présent : ce qu'était `tube_plein` avant
      // le 1er mai est inconnu, il ne peut donc rien affirmer à son sujet.
      expect(validatedIds(knowledgeState)).to.deep.equal(['skill_troue_1']);
    });
  });

  describe('#forgetCompetence', function () {
    it('ne ressuscite pas une compétence remise à zéro, alors que les réponses existent toujours', async function () {
      // given — les réponses subsistent après la remise à zéro. Elles ne sont plus
      // relues : rien ne peut reconstituer ce que l'effacement a retiré.
      buildLearningContent();
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: assessmentId } = databaseBuilder.factory.buildAssessment({ userId, competenceId: COMPETENCE_ID });
      answer({ userId, assessmentId, skillId: 'skill_plein_3', isOk: true, createdAt: new Date('2026-01-01') });
      await databaseBuilder.commit();

      const before = await knowledgeStateRepository.findByUserId({ userId });
      expect(before.validatedSkills()).to.have.lengthOf(3);

      // when
      await knowledgeStateRepository.forgetCompetence({ userId, competenceId: COMPETENCE_ID });

      // then — l'état est vide et les réponses sont toujours là, mais rien ne revient
      expect(await knex('knowledge-states').where({ userId })).to.be.empty;
      expect(await knex('answers').where({ assessmentId })).to.not.be.empty;
      expect((await knowledgeStateRepository.findByUserId({ userId })).isEmpty).to.be.true;
    });

    it('laisse intactes les compétences non concernées par la remise à zéro', async function () {
      // given
      buildLearningContent();
      databaseBuilder.factory.learningContent.buildSkill({
        id: 'skill_autre_1',
        name: '@autre1',
        level: 1,
        tubeId: 'tube_autre',
        competenceId: 'recCOMP_AUTRE',
        status: 'actif',
      });
      databaseBuilder.factory.learningContent.buildChallenge({
        id: 'challenge_skill_autre_1',
        skillId: 'skill_autre_1',
      });
      const { id: userId } = databaseBuilder.factory.buildUser();
      const { id: assessmentId } = databaseBuilder.factory.buildAssessment({ userId, competenceId: COMPETENCE_ID });
      answer({ userId, assessmentId, skillId: 'skill_plein_1', isOk: true, createdAt: new Date('2026-01-01') });
      answer({ userId, assessmentId, skillId: 'skill_autre_1', isOk: true, createdAt: new Date('2026-01-02') });
      await databaseBuilder.commit();

      // when — seule la première compétence est remise à zéro
      await knowledgeStateRepository.forgetCompetence({ userId, competenceId: COMPETENCE_ID });

      // then
      const after = await knowledgeStateRepository.findByUserId({ userId });
      expect(after.validatedSkills().map(({ id }) => id)).to.deep.equal(['skill_autre_1']);
    });
  });
});
