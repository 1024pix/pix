import EmberObject from '@ember/object';
import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Route | Assessments | Resume', function (hooks) {
  setupTest(hooks);

  let route;
  let storeStub;
  let findRecordStub;
  let queryRecordStub;

  hooks.beforeEach(function () {
    // define stubs
    findRecordStub = sinon.stub();
    queryRecordStub = sinon.stub();
    storeStub = Service.create({
      findRecord: findRecordStub,
      queryRecord: queryRecordStub,
    });

    route = this.owner.lookup('route:assessments.resume');
    route.set('store', storeStub);
    route.router = { replaceWith: sinon.stub() };
  });

  module('#redirect', function (hooks) {
    let assessment;

    hooks.beforeEach(function () {
      const answers = EmberObject.create();
      answers.reload = sinon.stub().resolves();
      assessment = EmberObject.create({ id: 123, isDemo: true, competenceId: 'recCompetenceId', answers });
      assessment.save = sinon.stub().resolves();
    });

    module('when the next challenge exists', function (hooks) {
      let nextChallenge;

      hooks.beforeEach(function () {
        nextChallenge = EmberObject.create({ id: 456 });
        queryRecordStub.resolves(nextChallenge);
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
                assert.expect(0);
                sinon.assert.calledOnce(route.router.replaceWith);
                sinon.assert.calledWith(route.router.replaceWith, 'assessments.challenge', 123);
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
                assert.expect(0);
                sinon.assert.calledOnce(route.router.replaceWith);
                sinon.assert.calledWith(route.router.replaceWith, 'assessments.checkpoint', 123);
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
              assert.expect(0);
              sinon.assert.calledOnce(route.router.replaceWith);
              sinon.assert.calledWith(route.router.replaceWith, 'assessments.challenge', 123);
            });
          });
        });
      });

      module('when assessment is a DEMO, PLACEMENT, CERTIFICATION or PREVIEW', function (hooks) {
        hooks.beforeEach(() => {
          assessment.isPlacement = true;
        });
        test('should redirect to the challenge view', function (assert) {
          // when
          const promise = route.redirect(assessment);

          // then
          return promise.then(() => {
            assert.expect(0);
            sinon.assert.calledOnce(route.router.replaceWith);
            sinon.assert.calledWith(route.router.replaceWith, 'assessments.challenge', 123);
          });
        });
      });
    });

    module('when the next challenge does not exist (is null)', function (hooks) {
      hooks.beforeEach(function () {
        queryRecordStub.resolves(null);
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

            test('should redirect to campaigns.assessment.skill-review page', function (assert) {
              // when
              const promise = route.redirect(assessment);

              // then
              return promise.then(() => {
                assert.expect(0);
                sinon.assert.calledWith(route.router.replaceWith, 'campaigns.assessment.skill-review', 'konami');
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
                assert.expect(0);
                sinon.assert.calledOnce(route.router.replaceWith);
                sinon.assert.calledWith(route.router.replaceWith, 'assessments.checkpoint', 123, {
                  queryParams: { finalCheckpoint: true, newLevel: null, competenceLeveled: null },
                });
              });
            });
          });
        });

        module('when assessment is completed', function (hooks) {
          hooks.beforeEach(function () {
            assessment.state = 'completed';
            assessment.isCompleted = true;
          });

          test('should redirect to campaigns.assessment.skill-review page', function (assert) {
            // when
            route.redirect(assessment);

            // then
            assert.expect(0);
            sinon.assert.calledWith(route.router.replaceWith, 'campaigns.assessment.skill-review', 'konami');
          });
        });
      });

      module('when assessment is a CERTIFICATION', function (hooks) {
        hooks.beforeEach(() => {
          assessment.isCertification = true;
          assessment.certificationNumber = 666;
        });

        test('should redirect to certifications.results page', function (assert) {
          // when
          const promise = route.redirect(assessment);

          // then
          return promise.then(() => {
            assert.expect(0);
            sinon.assert.calledWith(route.router.replaceWith, 'certifications.results', 666);
          });
        });
      });

      module('when assessment is a COMPETENCE_EVALUATION', function (hooks) {
        hooks.beforeEach(() => {
          assessment.isCompetenceEvaluation = true;
        });

        test('should redirect to competences.results page', function (assert) {
          // when
          const competenceId = 'recCompetenceId';
          const promise = route.redirect(assessment);

          // then
          return promise.then(() => {
            assert.expect(0);
            sinon.assert.calledWith(route.router.replaceWith, 'competences.results', competenceId, 123);
          });
        });
      });

      module('when assessment is a DEMO', function () {
        test('should redirect to assessments.results page', function (assert) {
          // when
          const promise = route.redirect(assessment);

          // then
          return promise.then(() => {
            assert.expect(0);
            sinon.assert.calledWith(route.router.replaceWith, 'assessments.results', 123);
          });
        });
      });
    });
  });
});
