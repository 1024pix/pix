import { setupTest } from 'ember-qunit';
import Joi from 'joi';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Controller | authenticated/smart-random-simulator/get-next-challenge', function (hooks) {
  setupTest(hooks);

  let controller;
  const fetchStub = sinon.stub(window, 'fetch');
  const returnedChallenge = {
    id: 'rec1kdnvnUagcpoYf',
    locales: ['fr', 'fr-fr'],
    skill: {
      id: 'skill2OLetxPA9DUVPt',
      name: '@outilsEval2',
      difficulty: 2,
    },
    focused: false,
  };

  const apiResponseBody = {
    challenge: returnedChallenge,
    smartRandomDetails: [],
  };

  hooks.beforeEach(async function () {
    controller = this.owner.lookup('controller:authenticated.smart-random-simulator.get-next-challenge');
  });

  module('#requestNextChallenge', function () {
    test('it should call window fetch function', async function (assert) {
      // given
      const apiResponse = new Response(JSON.stringify(apiResponseBody), { status: 200 });
      fetchStub.resolves(apiResponse);

      // when
      await controller.requestNextChallenge();

      // then
      assert.ok(controller);
    });

    module('when api answer is 200', function () {
      test('it should add returned challenge to current challenges', async function (assert) {
        // given
        const apiResponse = new Response(JSON.stringify(apiResponseBody), { status: 200 });
        fetchStub.resolves(apiResponse);

        // when
        await controller.requestNextChallenge();

        // then
        assert.deepEqual(controller.returnedChallenges, [
          {
            id: 'rec1kdnvnUagcpoYf',
            locales: ['fr', 'fr-fr'],
            skill: {
              id: 'skill2OLetxPA9DUVPt',
              name: '@outilsEval2',
              difficulty: 2,
            },
            focused: false,
          },
        ]);
      });
    });

    module('when api answer is 204', function () {
      test('it should set assessmentComplete', async function (assert) {
        // given
        const apiResponse = new Response(null, { status: 204 });
        fetchStub.resolves(apiResponse);
        assert.false(controller.assessmentComplete);

        // when
        await controller.requestNextChallenge();

        // then
        assert.ok(controller);
        assert.true(controller.assessmentComplete);
      });
    });

    module('when api answer is not 200 or 204', function () {
      test('it should call notification services with errors ', async function (assert) {
        // given
        const apiResponse = new Response(
          JSON.stringify({ errors: [{ detail: 'A serious error' }, { detail: 'This error will amaze you' }] }),
          { status: 400 },
        );
        fetchStub.resolves(apiResponse);
        controller.notifications = {
          error: sinon.stub(),
        };

        // when
        await controller.requestNextChallenge();

        // then
        assert.ok(controller);
        assert.ok(controller.notifications.error.calledTwice);
      });
    });
  });

  module('#reset', function () {
    test('it should reset simulator params and call requestNextChallenge', async function (assert) {
      // given
      controller.answers = [
        {
          result: 'ok',
          challengeId: '24',
        },
        {
          result: 'ko',
          challengeId: '12',
        },
      ];
      controller.knowledgeElements = [
        {
          source: 'direct',
          status: 'validated',
          answerId: 12,
          skillId: Joi.string().required(),
        },
      ];
      controller.returnedChallenges = [
        {
          id: '12',
          skill: {
            id: 12,
            name: "L'outil d'évaluation",
          },
          locales: ['fr'],
        },
      ];
      controller.assessmentComplete = true;
      controller.requestNextChallenge = sinon.stub().resolves();

      // when
      await controller.reset();

      // then
      assert.deepEqual(controller.answers, []);
      assert.deepEqual(controller.knowledgeElements, []);
      assert.deepEqual(controller.returnedChallenges, []);
      assert.false(controller.assessmentComplete);
      assert.ok(controller.requestNextChallenge.calledOnce);
    });
  });

  module('#previousChallenges', function () {
    test('it should return all chalenges but last if assessment is not complete', function (assert) {
      // given
      controller.returnedChallenges = [{ id: 1 }, { id: 2 }, { id: 3 }];
      controller.isAssessmentComplete = false;

      // when
      const previousChallenges = controller.previousChallenges;

      // then
      assert.deepEqual(previousChallenges, [{ id: 1 }, { id: 2 }]);
    });

    test('it should return all returned chalenges if assessment is complete', function (assert) {
      // given
      controller.returnedChallenges = [{ id: 1 }, { id: 2 }, { id: 3 }];
      controller.assessmentComplete = true;

      // when
      const previousChallenges = controller.previousChallenges;

      // then
      assert.deepEqual(previousChallenges, [{ id: 1 }, { id: 2 }, { id: 3 }]);
    });
  });

  module('#currentChallenge', function () {
    test('it should return last returned challenge if assessment is not complete', function (assert) {
      // given
      controller.returnedChallenges = [{ id: 1 }, { id: 2 }, { id: 3 }];
      controller.isAssessmentComplete = false;

      // when
      const currentChallenge = controller.currentChallenge;

      // then
      assert.deepEqual(currentChallenge, { id: 3 });
    });

    test('it should return null if assessment is complete', function (assert) {
      // given
      controller.returnedChallenges = [{ id: 1 }, { id: 2 }, { id: 3 }];
      controller.assessmentComplete = true;

      // when
      const currentChallenge = controller.currentChallenge;

      // then
      assert.strictEqual(currentChallenge, null);
    });
  });

  module('#failCurrentChallenge', function () {
    test('it should call requestNextChallenge method', async function (assert) {
      // given
      controller.returnedChallenges = [
        {
          id: 'rec1kdnvnUagcpoYf',
          locales: ['fr', 'fr-fr'],
          skill: {
            id: 'skill2OLetxPA9DUVPt',
            name: '@outilsEval2',
            difficulty: 2,
          },
          focused: false,
        },
      ];
      controller.requestNextChallenge = sinon.stub().resolves();

      // when
      await controller.succeedCurrentChallenge();

      // then
      assert.ok(controller.requestNextChallenge.calledOnce);
    });

    test('it should set result property on last returned challenge', async function (assert) {
      // given
      controller.returnedChallenges = [
        {
          id: 'rec1kdnvnUagcpoYf',
          locales: ['fr', 'fr-fr'],
          skill: {
            id: 'skill2OLetxPA9DUVPt',
            name: '@outilsEval2',
            difficulty: 2,
          },
          focused: false,
        },
      ];
      controller.requestNextChallenge = sinon.stub().resolves();

      // when
      await controller.failCurrentChallenge();

      // then
      assert.strictEqual(controller.returnedChallenges[0].result, 'ko');
    });

    test('it should add a new answer', async function (assert) {
      // given
      controller.returnedChallenges = [
        {
          id: 'rec1kdnvnUagcpoYf',
          locales: ['fr', 'fr-fr'],
          skill: {
            id: 'skill2OLetxPA9DUVPt',
            name: '@outilsEval2',
            difficulty: 2,
          },
          focused: false,
        },
      ];
      controller.requestNextChallenge = sinon.stub().resolves();
      controller.assessmentComplete = false;

      // when
      await controller.failCurrentChallenge();

      // then
      assert.strictEqual(controller.returnedChallenges[0].result, 'ko');
    });

    test('it should add direct and inferred knowledge elements', async function (assert) {
      // given
      controller.skills = [
        {
          id: 'skill1',
          name: '@outilsEval1',
          difficulty: 1,
        },
        {
          id: 'skill2',
          name: '@outilsEval2',
          difficulty: 2,
        },
        {
          id: 'skill3',
          name: '@outilsEval3',
          difficulty: 3,
        },
      ];
      controller.returnedChallenges = [
        {
          id: 'challenge1',
          locales: ['fr', 'fr-fr'],
          skill: {
            id: 'skill2',
            name: '@outilsEval2',
            difficulty: 2,
          },
          focused: false,
        },
      ];
      controller.requestNextChallenge = sinon.stub().resolves();
      controller.knowledgeElements = [];
      controller.answers = [];
      controller.assessmentComplete = false;

      // when
      await controller.failCurrentChallenge();

      // then
      assert.deepEqual(controller.knowledgeElements, [
        {
          source: 'direct',
          status: 'invalidated',
          answerId: controller.answers[0].id,
          skillId: 'skill2',
        },
        {
          source: 'inferred',
          status: 'invalidated',
          answerId: controller.answers[0].id,
          skillId: 'skill3',
        },
      ]);
    });
  });

  module('#succeedCurrentChallenge', function () {
    test('it should call requestNextChallenge method', async function (assert) {
      // given
      controller.returnedChallenges = [
        {
          id: 'rec1kdnvnUagcpoYf',
          locales: ['fr', 'fr-fr'],
          skill: {
            id: 'skill2OLetxPA9DUVPt',
            name: '@outilsEval2',
            difficulty: 2,
          },
          focused: false,
        },
      ];
      controller.requestNextChallenge = sinon.stub().resolves();

      // when
      await controller.succeedCurrentChallenge();

      // then
      assert.ok(controller.requestNextChallenge.calledOnce);
    });

    test('it should set result property on last returned challenge', async function (assert) {
      // given
      controller.returnedChallenges = [
        {
          id: 'rec1kdnvnUagcpoYf',
          locales: ['fr', 'fr-fr'],
          skill: {
            id: 'skill2OLetxPA9DUVPt',
            name: '@outilsEval2',
            difficulty: 2,
          },
          focused: false,
        },
      ];
      controller.requestNextChallenge = sinon.stub().resolves();

      // when
      await controller.succeedCurrentChallenge();

      // then
      assert.strictEqual(controller.returnedChallenges[0].result, 'ok');
    });

    test('it should add a new answer', async function (assert) {
      // given
      controller.returnedChallenges = [
        {
          id: 'challenge1',
          locales: ['fr', 'fr-fr'],
          skill: {
            id: 'skill2OLetxPA9DUVPt',
            name: '@outilsEval2',
            difficulty: 2,
          },
          focused: false,
        },
      ];
      controller.requestNextChallenge = sinon.stub().resolves();

      // when
      await controller.succeedCurrentChallenge();

      // then
      assert.deepEqual(controller.answers[0].result, 'ok');
      assert.deepEqual(controller.answers[0]['challengeId'], 'challenge1');
    });

    test('it should add direct and inferred knowledge elements', async function (assert) {
      // given
      controller.skills = [
        {
          id: 'skill1',
          name: '@outilsEval1',
          difficulty: 1,
        },
        {
          id: 'skill2',
          name: '@outilsEval2',
          difficulty: 2,
        },
        {
          id: 'skill3',
          name: '@outilsEval3',
          difficulty: 3,
        },
      ];
      controller.returnedChallenges = [
        {
          id: 'challenge1',
          locales: ['fr', 'fr-fr'],
          skill: {
            id: 'skill2',
            name: '@outilsEval2',
            difficulty: 2,
          },
          focused: false,
        },
      ];
      controller.requestNextChallenge = sinon.stub().resolves();
      controller.knowledgeElements = [];
      controller.answers = [];
      controller.assessmentComplete = false;

      // when
      await controller.succeedCurrentChallenge();

      // then
      assert.deepEqual(controller.knowledgeElements, [
        {
          source: 'direct',
          status: 'validated',
          answerId: controller.answers[0].id,
          skillId: 'skill2',
        },
        {
          source: 'inferred',
          status: 'validated',
          answerId: controller.answers[0].id,
          skillId: 'skill1',
        },
      ]);
    });
  });

  module('#getTubeNameFromSkillName', function () {
    test('it should extract tube name from skill name', function (assert) {
      assert.strictEqual(controller.getTubeNameFromSkillName('@planterDesChoux2'), '@planterDesChoux');
    });
  });
});
