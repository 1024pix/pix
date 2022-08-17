import EmberObject from '@ember/object';
import Service from '@ember/service';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe.only('Unit | Route | Assessments | Resume', function () {
  setupTest();

  let route;
  let storeStub;
  let findRecordStub;
  let queryRecordStub;

  beforeEach(function () {
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

  describe('#afterModel', function () {
    let assessment;

    beforeEach(function () {
      const answers = EmberObject.create();
      answers.reload = sinon.stub().resolves();
      assessment = EmberObject.create({ id: 123, isDemo: true, competenceId: 'recCompetenceId', answers });
      assessment.save = sinon.stub().resolves();
    });

    context('when the next challenge exists', function () {
      let nextChallenge;

      beforeEach(function () {
        nextChallenge = EmberObject.create({ id: 456 });
        queryRecordStub.resolves(nextChallenge);
        route.assessmentHasNoMoreQuestions = false;
      });

      context('when assessment is a CAMPAIGN', function () {
        beforeEach(function () {
          assessment.isForCampaign = true;
          assessment.isDemo = false;
          assessment.hasCheckpoints = true;
        });

        context('when checkpoint is reached', function () {
          beforeEach(function () {
            assessment.answers = [{}, {}, {}, {}, {}];
            assessment.answers.reload = sinon.stub().resolves();
          });

          context('when user has seen checkpoint', function () {
            beforeEach(function () {
              route.hasSeenCheckpoint = true;
            });

            it('should redirect to the challenge view', function () {
              // when
              const promise = route.afterModel(assessment);

              // then
              return promise.then(() => {
                sinon.assert.calledOnce(route.router.replaceWith);
                sinon.assert.calledWith(route.router.replaceWith, 'assessments.challenge', 123);
              });
            });
          });

          context('when user has not seen checkpoint', function () {
            beforeEach(function () {
              route.hasSeenCheckpoint = false;
            });

            it('should redirect to assessment checkpoint page', function () {
              // when
              const promise = route.afterModel(assessment);

              // then
              return promise.then(() => {
                sinon.assert.calledOnce(route.router.replaceWith);
                sinon.assert.calledWith(route.router.replaceWith, 'assessments.checkpoint', 123);
              });
            });
          });
        });

        context('when checkpoint is not reached', function () {
          it('should redirect to the challenge view', function () {
            // when
            const promise = route.afterModel(assessment);

            // then
            return promise.then(() => {
              sinon.assert.calledOnce(route.router.replaceWith);
              sinon.assert.calledWith(route.router.replaceWith, 'assessments.challenge', 123);
            });
          });
        });
      });

      context('when assessment is a DEMO, PLACEMENT, CERTIFICATION or PREVIEW', function () {
        beforeEach(() => {
          assessment.isPlacement = true;
        });
        it('should redirect to the challenge view', function () {
          // when
          const promise = route.afterModel(assessment);

          // then
          return promise.then(() => {
            sinon.assert.calledOnce(route.router.replaceWith);
            sinon.assert.calledWith(route.router.replaceWith, 'assessments.challenge', 123);
          });
        });
      });
    });

    context('when the next challenge does not exist (is null)', function () {
      beforeEach(function () {
        queryRecordStub.resolves(null);
        route.assessmentHasNoMoreQuestions = true;
      });

      context('when assessment is a CAMPAIGN', function () {
        beforeEach(function () {
          assessment.isForCampaign = true;
          assessment.isDemo = false;
          assessment.hasCheckpoints = true;
          assessment.codeCampaign = 'konami';
        });

        context('when assessment is not completed', function () {
          beforeEach(function () {
            assessment.state = 'started';
            assessment.isCompleted = false;
          });

          context('when user has seen checkpoint', function () {
            beforeEach(function () {
              route.hasSeenCheckpoint = true;
            });

            it('should redirect to campaigns.assessment.skill-review page', function () {
              // when
              const promise = route.afterModel(assessment);

              // then
              return promise.then(() => {
                sinon.assert.calledWith(route.router.replaceWith, 'campaigns.assessment.skill-review', 'konami');
              });
            });
          });

          context('when user has not seen checkpoint', function () {
            beforeEach(function () {
              route.hasSeenCheckpoint = false;
            });

            it('should redirect to assessment last checkpoint page', function () {
              // when
              const promise = route.afterModel(assessment);

              // then
              return promise.then(() => {
                sinon.assert.calledOnce(route.router.replaceWith);
                sinon.assert.calledWith(route.router.replaceWith, 'assessments.checkpoint', 123, {
                  queryParams: { finalCheckpoint: true, newLevel: null, competenceLeveled: null },
                });
              });
            });
          });
        });

        context('when assessment is completed', function () {
          beforeEach(function () {
            assessment.state = 'completed';
            assessment.isCompleted = true;
          });

          it('should redirect to campaigns.assessment.skill-review page', function () {
            // when
            route.afterModel(assessment);

            // then
            sinon.assert.calledWith(route.router.replaceWith, 'campaigns.assessment.skill-review', 'konami');
          });
        });
      });

      context('when assessment is a CERTIFICATION', function () {
        beforeEach(() => {
          assessment.isCertification = true;
          assessment.certificationNumber = 666;
        });

        it('should redirect to certifications.results page', function () {
          // when
          const promise = route.afterModel(assessment);

          // then
          return promise.then(() => {
            sinon.assert.calledWith(route.router.replaceWith, 'certifications.results', 666);
          });
        });
      });

      context('when assessment is a COMPETENCE_EVALUATION', function () {
        beforeEach(() => {
          assessment.isCompetenceEvaluation = true;
        });

        it('should redirect to competences.results page', function () {
          // when
          const competenceId = 'recCompetenceId';
          const promise = route.afterModel(assessment);

          // then
          return promise.then(() => {
            sinon.assert.calledWith(route.router.replaceWith, 'competences.results', competenceId, 123);
          });
        });
      });

      context('when assessment is a DEMO', function () {
        it('should redirect to assessments.results page', function () {
          // when
          const promise = route.afterModel(assessment);

          // then
          return promise.then(() => {
            sinon.assert.calledWith(route.router.replaceWith, 'assessments.results', 123);
          });
        });
      });
    });
  });
});
