import { KnowledgeState } from '../../../../../src/shared/domain/models/KnowledgeState.js';
import * as competenceScoreRepository from '../../../../../src/shared/infrastructure/repositories/competence-score-repository.js';
import * as knowledgeStateRepository from '../../../../../src/shared/infrastructure/repositories/knowledge-state-repository.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import * as learningContentBuilder from '../../../../tooling/learning-content-builder/index.js';

const buildTube = ({ tubeId, competenceId, levels }) => {
  const skills = levels.map((level) =>
    learningContentBuilder.buildSkill({
      id: `${tubeId}${level}`,
      name: `@${tubeId}${level}`,
      level,
      pixValue: 4,
      tubeId,
      competenceId,
      status: 'actif',
    }),
  );
  databaseBuilder.factory.learningContent.build({ skills });
  return skills;
};

const idsOf = (skills) => skills.map(({ id }) => id).toSorted();

describe('Integration | Repository | knowledgeStateRepository', function () {
  describe('#findByUserId', function () {
    it('hydrate l état du référentiel de ses tubes et le déplie en trois zones', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      buildTube({ tubeId: 'web', competenceId: 'recComp1', levels: [1, 2, 3, 4] });
      buildTube({ tubeId: 'mail', competenceId: 'recComp2', levels: [1, 2] });
      databaseBuilder.factory.buildKnowledgeState({
        userId,
        tubeId: 'web',
        floor: 2,
        ceiling: 4,
        directLevels: [2, 4],
      });
      await databaseBuilder.commit();

      // when
      const knowledgeState = await knowledgeStateRepository.findByUserId({ userId });

      // then
      expect(idsOf(knowledgeState.validatedSkills())).to.deep.equal(['web1', 'web2']);
      expect(idsOf(knowledgeState.invalidatedSkills())).to.deep.equal(['web4']);
      expect(knowledgeState.tubeIds).to.deep.equal(['web']);
    });

    it('rend un état vide pour un utilisateur sans état', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      // when
      const knowledgeState = await knowledgeStateRepository.findByUserId({ userId });

      // then
      expect(knowledgeState.isEmpty).to.be.true;
    });

    it('écarte, à une date passée, les tubes qui ont bougé depuis', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      buildTube({ tubeId: 'ancien', competenceId: 'recComp1', levels: [1] });
      buildTube({ tubeId: 'recent', competenceId: 'recComp1', levels: [1] });
      databaseBuilder.factory.buildKnowledgeState({
        userId,
        tubeId: 'ancien',
        floor: 1,
        directLevels: [1],
        updatedAt: new Date('2024-01-01'),
      });
      databaseBuilder.factory.buildKnowledgeState({
        userId,
        tubeId: 'recent',
        floor: 1,
        directLevels: [1],
        updatedAt: new Date('2026-01-01'),
      });
      await databaseBuilder.commit();

      // when
      const knowledgeState = await knowledgeStateRepository.findByUserId({ userId, limitDate: new Date('2025-01-01') });

      // then
      expect(knowledgeState.tubeIds).to.deep.equal(['ancien']);
    });
  });

  describe('#findByUserIds', function () {
    it('rend l état de chaque utilisateur demandé, y compris vide', async function () {
      // given
      const userId1 = databaseBuilder.factory.buildUser().id;
      const userId2 = databaseBuilder.factory.buildUser().id;
      buildTube({ tubeId: 'web', competenceId: 'recComp1', levels: [1, 2] });
      databaseBuilder.factory.buildKnowledgeState({ userId: userId1, tubeId: 'web', floor: 2, directLevels: [2] });
      await databaseBuilder.commit();

      // when
      const statesByUserId = await knowledgeStateRepository.findByUserIds({ userIds: [userId1, userId2] });

      // then
      expect(idsOf(statesByUserId.get(userId1).validatedSkills())).to.deep.equal(['web1', 'web2']);
      expect(statesByUserId.get(userId2).isEmpty).to.be.true;
    });
  });

  describe('#save', function () {
    it('écrit les tubes demandés et resserre l état au passage suivant', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const [, , skillLevel3] = buildTube({ tubeId: 'web', competenceId: 'recComp1', levels: [1, 2, 3] });
      await databaseBuilder.commit();

      const before = await knowledgeStateRepository.findByUserId({ userId });
      const after = before.withAnswer({ skill: { ...skillLevel3, difficulty: 3, tubeId: 'web' }, isOk: true });

      // when
      await knowledgeStateRepository.save({ userId, knowledgeState: after, tubeIds: ['web'] });

      // then
      const reread = await knowledgeStateRepository.findByUserId({ userId });
      expect(reread.boundsOf('web')).to.deep.include({ floor: 3, directLevels: [3] });

      // when : un second passage met la ligne à jour, il ne la double pas
      const tightened = reread.withAnswer({ skill: { ...skillLevel3, difficulty: 3, tubeId: 'web' }, isOk: false });
      await knowledgeStateRepository.save({ userId, knowledgeState: tightened, tubeIds: ['web'] });

      const final = await knowledgeStateRepository.findByUserId({ userId });
      expect(final.tubeIds).to.have.lengthOf(1);
    });
  });

  describe('#forgetCompetence', function () {
    it('efface l état des tubes de la compétence, sans trace, et ne touche pas les autres', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      buildTube({ tubeId: 'aOublier', competenceId: 'recCompX', levels: [1] });
      buildTube({ tubeId: 'aGarder', competenceId: 'recCompY', levels: [1] });
      databaseBuilder.factory.buildKnowledgeState({ userId, tubeId: 'aOublier', floor: 1, directLevels: [1] });
      databaseBuilder.factory.buildKnowledgeState({ userId, tubeId: 'aGarder', floor: 1, directLevels: [1] });
      await databaseBuilder.commit();

      // when
      await knowledgeStateRepository.forgetCompetence({ userId, competenceId: 'recCompX' });

      // then
      const knowledgeState = await knowledgeStateRepository.findByUserId({ userId });
      expect(knowledgeState.tubeIds).to.deep.equal(['aGarder']);
    });
  });

  describe('the competence score balance', function () {
    it('is recomputed on every position write, against the current referential', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const [, skillLevel2] = buildTube({ tubeId: 'web', competenceId: 'recComp1', levels: [1, 2, 3] });
      await databaseBuilder.commit();

      const before = await knowledgeStateRepository.findByUserId({ userId });
      const after = before.withAnswer({ skill: { ...skillLevel2, difficulty: 2, tubeId: 'web' }, isOk: true });

      // when
      await knowledgeStateRepository.save({ userId, knowledgeState: after, tubeIds: ['web'] });

      // then: web1 and web2 validated, 4 pix each
      const pixByCompetence = await competenceScoreRepository.findByUserId({ userId });
      expect(pixByCompetence.get('recComp1')).to.equal(8);
    });

    it('counts the whole competence, beyond the hydrated scope of the saved state', async function () {
      // given: the competence has two tubes, one already validated by the user
      const userId = databaseBuilder.factory.buildUser().id;
      const [, skillLevel2] = buildTube({ tubeId: 'web', competenceId: 'recComp1', levels: [1, 2, 3] });
      buildTube({ tubeId: 'mail', competenceId: 'recComp1', levels: [1, 2] });
      databaseBuilder.factory.buildKnowledgeState({ userId, tubeId: 'mail', floor: 1, directLevels: [1] });
      await databaseBuilder.commit();

      // the saved state only carries the answered tube, as in a campaign assessment
      const narrowState = new KnowledgeState().withAnswer({
        skill: { ...skillLevel2, difficulty: 2, tubeId: 'web' },
        isOk: true,
      });

      // when
      await knowledgeStateRepository.save({ userId, knowledgeState: narrowState, tubeIds: ['web'] });

      // then: web1 + web2 + mail1, 4 pix each
      const pixByCompetence = await competenceScoreRepository.findByUserId({ userId });
      expect(pixByCompetence.get('recComp1')).to.equal(12);
    });

    it('is erased when the competence is reset, and only then', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const [skillX] = buildTube({ tubeId: 'aOublier', competenceId: 'recCompX', levels: [1] });
      const [skillY] = buildTube({ tubeId: 'aGarder', competenceId: 'recCompY', levels: [1] });
      await databaseBuilder.commit();

      const before = await knowledgeStateRepository.findByUserId({ userId });
      const after = before
        .withAnswer({ skill: { ...skillX, difficulty: 1, tubeId: 'aOublier' }, isOk: true })
        .withAnswer({ skill: { ...skillY, difficulty: 1, tubeId: 'aGarder' }, isOk: true });
      await knowledgeStateRepository.save({ userId, knowledgeState: after });

      // when
      await knowledgeStateRepository.forgetCompetence({ userId, competenceId: 'recCompX' });

      // then
      const pixByCompetence = await competenceScoreRepository.findByUserId({ userId });
      expect(pixByCompetence.has('recCompX')).to.be.false;
      expect(pixByCompetence.get('recCompY')).to.equal(4);
    });
  });
});
