import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import createComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | Smart Random Simulator | Tubes Viewer', function (hooks) {
  setupTest(hooks);

  module('#getStepTagColor', function () {
    test('it should return "primary" color if index is lower than displayedStepIndex', async function (assert) {
      const component = createComponent('component:smart-random-simulator/tubes-viewer');
      component.args.displayedStepIndex = 2;
      const tagColor = component.getStepTagColor(1);
      assert.strictEqual(tagColor, 'primary');
    });

    test('it should return "primary" color if index is equal to displayedStepIndex', async function (assert) {
      const component = createComponent('component:smart-random-simulator/tubes-viewer');
      component.args.displayedStepIndex = 2;
      const tagColor = component.getStepTagColor(1);
      assert.strictEqual(tagColor, 'primary');
    });

    test('it should return "neutral" if index si greater than displayStepIndex', async function (assert) {
      const component = createComponent('component:smart-random-simulator/tubes-viewer');
      component.args.displayedStepIndex = 2;
      const tagColor = component.getStepTagColor(3);
      assert.strictEqual(tagColor, 'neutral');
    });
  });

  module('#getEliminatedSkillsByStepCount', function () {
    test('it should return the number of eliminated skills by step', async function (assert) {
      const component = createComponent('component:smart-random-simulator/tubes-viewer');
      component.args.totalNumberOfSkills = 50;
      component.args.smartRandomDetails = {
        steps: [
          {
            outputSkills: [
              Symbol('skill'),
              Symbol('skill'),
              Symbol('skill'),
              Symbol('skill'),
              Symbol('skill'),
              Symbol('skill'),
              Symbol('skill'),
              Symbol('skill'),
            ],
          },
          { outputSkills: [Symbol('skill'), Symbol('skill'), Symbol('skill')] },
          { outputSkills: [Symbol('skill')] },
        ],
      };

      const eliminatedSkillsCountInFirstStep = component.getEliminatedSkillsByStepCount(0);
      assert.strictEqual(eliminatedSkillsCountInFirstStep, 42);
      const eliminatedSkillsCountInSecondStep = component.getEliminatedSkillsByStepCount(1);
      assert.strictEqual(eliminatedSkillsCountInSecondStep, 5);
      const eliminatedSkillsCountInThirdStep = component.getEliminatedSkillsByStepCount(2);
      assert.strictEqual(eliminatedSkillsCountInThirdStep, 2);
    });
  });

  module('#getRemainingSkillsCountAfterStep', function () {
    test('it should return the number of remaining skills after step', async function (assert) {
      const component = createComponent('component:smart-random-simulator/tubes-viewer');
      component.args.smartRandomDetails = {
        steps: [
          {
            outputSkills: [
              Symbol('skill'),
              Symbol('skill'),
              Symbol('skill'),
              Symbol('skill'),
              Symbol('skill'),
              Symbol('skill'),
            ],
          },
          {
            outputSkills: [
              Symbol('skill'),
              Symbol('skill'),
              Symbol('skill'),
              Symbol('skill'),
              Symbol('skill'),
              Symbol('skill'),
            ],
          },
          { outputSkills: [Symbol('skill')] },
          { outputSkills: [] },
        ],
      };

      const remainingSkillsCountAfterFirstStep = component.getRemainingSkillsCountAfterStep(0);
      assert.strictEqual(remainingSkillsCountAfterFirstStep, 6);
      const remainingSkillsCountAfterSecondStep = component.getRemainingSkillsCountAfterStep(1);
      assert.strictEqual(remainingSkillsCountAfterSecondStep, 6);
      const remainingSkillsCountAfterThirdStep = component.getRemainingSkillsCountAfterStep(2);
      assert.strictEqual(remainingSkillsCountAfterThirdStep, 1);
      const remainingSkillsCountAfterFourthStep = component.getRemainingSkillsCountAfterStep(3);
      assert.strictEqual(remainingSkillsCountAfterFourthStep, 0);
    });
  });

  module('#getSkillStatus', function (hooks) {
    let component;

    hooks.beforeEach(function () {
      component = createComponent('component:smart-random-simulator/tubes-viewer');
    });

    test('it should return "missing" if skill is not present in tube', async function (assert) {
      component.args.knowledgeElements = [
        { skillId: 1, status: 'validated' },
        { skillId: 2, status: 'invalidated' },
      ];
      const tube = {
        skills: [
          { id: 1, difficulty: 1 },
          { id: 2, difficulty: 2 },
        ],
      };
      const level = 3;

      const skillStatus = component.getSkillStatus(tube, level);
      assert.strictEqual(skillStatus, 'missing');
    });

    test('it should return "current" if skill is the current skill', async function (assert) {
      component.args.currentSkillId = 2;
      const tube = {
        skills: [
          { id: 2, difficulty: 1 },
          { id: 8, difficulty: 2 },
        ],
      };
      const level = 1;

      const skillStatus = component.getSkillStatus(tube, level);
      assert.strictEqual(skillStatus, 'current');
    });

    test('it should return the knowledge element status if skill is present in knowledge elements', async function (assert) {
      component.args.currentSkillId = Symbol('skill');
      component.args.knowledgeElements = [
        { skillId: 1, status: 'validated' },
        { skillId: 2, status: 'invalidated' },
      ];
      const tube = {
        skills: [
          { id: 1, difficulty: 1 },
          { id: 2, difficulty: 2 },
        ],
      };

      const skillStatusForFistKnowledgeElement = component.getSkillStatus(tube, 1);
      assert.strictEqual(skillStatusForFistKnowledgeElement, 'validated');
      const skillStatusForSecondKnowledgeElement = component.getSkillStatus(tube, 2);
      assert.strictEqual(skillStatusForSecondKnowledgeElement, 'invalidated');
    });

    test('it should return "eliminated" if skill is not present in selected step', async function (assert) {
      component.args.currentSkillId = 128;
      component.args.displayedStepIndex = 3;
      component.args.knowledgeElements = [];
      component.args.smartRandomDetails = {
        steps: [
          { outputSkills: [Symbol('skill')] },
          { outputSkills: [Symbol('skill')] },
          { outputSkills: [Symbol('skill')] },
          {
            outputSkills: [
              { id: 2, difficulty: 2 },
              { id: 3, difficulty: 3 },
              { id: 4, difficulty: 4 },
              { id: 5, difficulty: 5 },
              { id: 6, difficulty: 6 },
              { id: 7, difficulty: 7 },
            ],
          },
        ],
      };

      const tube = {
        skills: [{ id: 20, difficulty: 2 }],
      };

      assert.strictEqual(component.getSkillStatus(tube, 2), 'eliminated');
    });
  });

  module('#knowledgeElementForSkill', function () {
    test('it should return the knowledge element if skill is present in knowledge elements', async function (assert) {
      const component = createComponent('component:smart-random-simulator/tubes-viewer');
      component.args.knowledgeElements = [
        { skillId: 1, status: 'validated' },
        { skillId: 2, status: 'invalidated' },
      ];
      const skill = { id: 1 };

      const knowledgeElement = component.knowledgeElementForSkill(skill);
      assert.deepEqual(knowledgeElement, { skillId: 1, status: 'validated' });
    });

    test('it should return undefined if skill is not present in knowledge elements', async function (assert) {
      const component = createComponent('component:smart-random-simulator/tubes-viewer');
      component.args.knowledgeElements = [
        { skillId: 1, status: 'validated' },
        { skillId: 2, status: 'invalidated' },
      ];
      const skill = { id: 3 };

      const knowledgeElement = component.knowledgeElementForSkill(skill);
      assert.strictEqual(knowledgeElement, undefined);
    });
  });
});
