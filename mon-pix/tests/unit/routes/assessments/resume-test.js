import EmberObject from '@ember/object';
import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | Assessments | Resume', function (hooks) {
  setupTest(hooks);

  let route;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:assessments.resume');
    route.router = { replaceWith: sinon.stub() };
  });

  module('#redirect', function (hooks) {
    let assessment;

    hooks.beforeEach(function () {
      const answers = EmberObject.create();
      answers.reload = sinon.stub().resolves();
      assessment = EmberObject.create({
        id: '123',
        isDemo: true,
        competenceId: 'recCompetenceId',
        answers,
        orderedChallengeIdsAnswered: ['someChallengeId'],
      });
      assessment.save = sinon.stub().resolves();
    });

    module('when the next challenge exists', function (hooks) {
      hooks.beforeEach(function () {
        route.assessmentHasNoMoreQuestions = false;
      });

      module('when assessment is a CAMPAIGN', function (hooks) {
        hooks.beforeEach(function () {
          assessment.isForCampaign = true;
          assessment.isDemo = false;
          assessment.hasCheckpoints = true;
        });

        module('when checkpoint is reached', function (hooks) {
          hooks.beforeEach(function () {
            assessment.answers = [{}, {}, {}, {}, {}];
            assessment.orderedChallengeIdsAnswered = ['chal1', 'chal2', 'chal3', 'chal4', 'chal5'];
            assessment.answers.reload = sinon.stub().resolves();
          });

          module('when user has seen checkpoint', function (hooks) {
            hooks.beforeEach(function () {
              route.hasSeenCheckpoint = true;
            });

            test('should redirect to the challenge view', function (assert) {
              // when
              const promise = route.redirect(assessment);

              // then
              return promise.then(() => {
                sinon.assert.calledOnce(route.router.replaceWith);
                sinon.assert.calledWith(route.router.replaceWith, 'assessments.challenge', '123');
                assert.ok(true);
              });
            });
          });

          module('when user has not seen checkpoint', function (hooks) {
            hooks.beforeEach(function () {
              route.hasSeenCheckpoint = false;
            });

            test('should redirect to assessment checkpoint page', function (assert) {
              // when
              const promise = route.redirect(assessment);

              // then
              return promise.then(() => {
                sinon.assert.calledOnce(route.router.replaceWith);
                sinon.assert.calledWith(route.router.replaceWith, 'assessments.checkpoint', '123');
                assert.ok(true);
              });
            });
          });
        });

        module('when checkpoint is not reached', function () {
          test('should redirect to the challenge view', function (assert) {
            // when
            const promise = route.redirect(assessment);

            // then
            return promise.then(() => {
              sinon.assert.calledOnce(route.router.replaceWith);
              sinon.assert.calledWith(route.router.replaceWith, 'assessments.challenge', '123');
              assert.ok(true);
            });
          });
        });
      });

      module('when assessment is a DEMO, PLACEMENT, CERTIFICATION or PREVIEW', function (hooks) {
        hooks.beforeEach(function () {
          assessment.isPlacement = true;
        });
        test('should redirect to the challenge view', function (assert) {
          // when
          const promise = route.redirect(assessment);

          // then
          return promise.then(() => {
            sinon.assert.calledOnce(route.router.replaceWith);
            sinon.assert.calledWith(route.router.replaceWith, 'assessments.challenge', '123');
            assert.ok(true);
          });
        });
      });
    });

    module('when the next challenge does not exist (is null)', function (hooks) {
      hooks.beforeEach(function () {
        route.assessmentHasNoMoreQuestions = true;
      });

      module('when assessment is a CAMPAIGN', function (hooks) {
        hooks.beforeEach(function () {
          assessment.isForCampaign = true;
          assessment.isDemo = false;
          assessment.hasCheckpoints = true;
          assessment.codeCampaign = 'konami';
        });

        module('when assessment is not completed', function (hooks) {
          hooks.beforeEach(function () {
            assessment.state = 'started';
            assessment.isCompleted = false;
          });

          module('when user has seen checkpoint', function (hooks) {
            hooks.beforeEach(function () {
              route.hasSeenCheckpoint = true;
            });

            test('should redirect to campaigns.assessment.results page', function (assert) {
              // when
              const promise = route.redirect(assessment);

              // then
              return promise.then(() => {
                sinon.assert.calledWith(route.router.replaceWith, 'campaigns.assessment.results', 'konami');
                assert.ok(true);
              });
            });
          });

          module('when user has not seen checkpoint', function (hooks) {
            hooks.beforeEach(function () {
              route.hasSeenCheckpoint = false;
            });

            test('should redirect to assessment last checkpoint page', function (assert) {
              // when
              const promise = route.redirect(assessment);

              // then
              return promise.then(() => {
                sinon.assert.calledOnce(route.router.replaceWith);
                sinon.assert.calledWith(route.router.replaceWith, 'assessments.checkpoint', '123', {
                  queryParams: { finalCheckpoint: true, newLevel: null, competenceLeveled: null },
                });
                assert.ok(true);
              });
            });
          });
        });

        module('when assessment is completed', function (hooks) {
          hooks.beforeEach(function () {
            assessment.state = 'completed';
            assessment.isCompleted = true;
          });

          test('should redirect to campaigns.assessment.results page', function (assert) {
            // when
            route.redirect(assessment);

            // then
            sinon.assert.calledWith(route.router.replaceWith, 'campaigns.assessment.results', 'konami');
            assert.ok(true);
          });
        });
      });

      module('when assessment is a CERTIFICATION', function (hooks) {
        hooks.beforeEach(function () {
          assessment.isCertification = true;
          assessment.certificationNumber = 666;
        });

        test('should redirect to certifications.results page', async function (assert) {
          // when
          await route.redirect(assessment);

          // then
          sinon.assert.calledWith(route.router.replaceWith, 'authenticated.certifications.results', 666);
          assert.ok(true);
        });
      });

      module('when assessment is a COMPETENCE_EVALUATION', function (hooks) {
        hooks.beforeEach(function () {
          assessment.isCompetenceEvaluation = true;
        });

        test('should redirect to competences.results page', function (assert) {
          // when
          const competenceId = 'recCompetenceId';
          const promise = route.redirect(assessment);

          // then
          return promise.then(() => {
            sinon.assert.calledWith(route.router.replaceWith, 'authenticated.competences.results', competenceId, '123');
            assert.ok(true);
          });
        });
      });

      module('when assessment is a DEMO', function () {
        test('should redirect to assessments.results page', function (assert) {
          // when
          const promise = route.redirect(assessment);

          // then
          return promise.then(() => {
            sinon.assert.calledWith(route.router.replaceWith, 'assessments.results', '123');
            assert.ok(true);
          });
        });
      });
    });
  });

  module('#error', function (hooks) {
    let certificationTechnicalErrorService;

    hooks.beforeEach(function () {
      certificationTechnicalErrorService = Service.create({ setError: sinon.stub() });
      this.owner.register('service:certification-technical-error', certificationTechnicalErrorService, {
        instantiate: false,
      });
      route = this.owner.lookup('route:assessments.resume');
    });

    module('when error code is ASSESSMENT_LACK_OF_CHALLENGES', function () {
      test('calls certificationTechnicalError.setError with isToBeCancelled', function (assert) {
        // given
        const error = { errors: [{ code: 'ASSESSMENT_LACK_OF_CHALLENGES', meta: { isToBeCancelled: true } }] };

        // when
        const result = route.error(error);

        // then
        sinon.assert.calledWith(certificationTechnicalErrorService.setError, { isToBeCancelled: true });
        assert.false(result);
      });

      test('defaults isToBeCancelled to false when meta is absent', function (assert) {
        // given
        const error = { errors: [{ code: 'ASSESSMENT_LACK_OF_CHALLENGES' }] };

        // when
        route.error(error);

        // then
        sinon.assert.calledWith(certificationTechnicalErrorService.setError, { isToBeCancelled: false });
        assert.ok(true);
      });
    });

    module('when error code is something else', function () {
      test('returns true to propagate the error', function (assert) {
        // given
        const error = { errors: [{ code: 'SOME_OTHER_ERROR' }] };

        // when
        const result = route.error(error);

        // then
        assert.true(result);
      });
    });
  });
});
