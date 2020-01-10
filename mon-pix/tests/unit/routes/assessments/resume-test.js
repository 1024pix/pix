import EmberObject from '@ember/object';
import Service from '@ember/service';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | Assessments | Resume', function() {
  setupTest();

  let route;
  let storeStub;
  let findRecordStub;
  let queryRecordStub;

  beforeEach(function() {
    // define stubs
    findRecordStub = sinon.stub();
    queryRecordStub = sinon.stub();
    storeStub = Service.create({
      findRecord: findRecordStub,
      queryRecord: queryRecordStub,
    });

    route = this.owner.lookup('route:assessments.resume');
    route.set('store', storeStub);
    route.replaceWith = sinon.stub();
  });

  describe('#afterModel', function() {

    let assessment;

    beforeEach(function() {
      assessment = EmberObject.create({ id: 123, isDemo: true, competenceId: 'recCompetenceId' });
      assessment.save = sinon.stub().resolves();
    });

    it('should not query next challenge if assessment is completed', function() {
      assessment.isCompleted = true;

      route.afterModel(assessment);

      sinon.assert.notCalled(queryRecordStub);
    });

    it('should get the next challenge of the assessment', function() {
      // given
      queryRecordStub.resolves();

      // when
      const promise = route.afterModel(assessment);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(queryRecordStub);
        sinon.assert.calledWith(queryRecordStub, 'challenge', { assessmentId: 123 });
      });
    });

    context('when the next challenge exists', function() {

      let nextChallenge;

      beforeEach(function() {
        nextChallenge = EmberObject.create({ id: 456 });
        queryRecordStub.resolves(nextChallenge);
      });

      context('when assessment is a SMART_PLACEMENT', function() {

        beforeEach(function() {
          assessment.isSmartPlacement = true;
          assessment.isDemo = false;
          assessment.hasCheckpoints = true;
        });

        context('when checkpoint is reached', function() {

          beforeEach(function() {
            assessment.answers = [{}, {}, {}, {}, {}];
          });

          context('when user has seen checkpoint', function() {

            beforeEach(function() {
              route.hasSeenCheckpoint = true;
            });

            it('should redirect to the challenge view', function() {
              // when
              const promise = route.afterModel(assessment);

              // then
              return promise.then(() => {
                sinon.assert.calledOnce(route.replaceWith);
                sinon.assert.calledWith(route.replaceWith, 'assessments.challenge', 123, 456);
              });
            });
          });

          context('when user has not seen checkpoint', function() {

            beforeEach(function() {
              route.hasSeenCheckpoint = false;
            });

            it('should redirect to assessment checkpoint page', function() {
              // when
              const promise = route.afterModel(assessment);

              // then
              return promise.then(() => {
                sinon.assert.calledOnce(route.replaceWith);
                sinon.assert.calledWith(route.replaceWith, 'assessments.checkpoint', 123);
              });
            });
          });
        });

        context('when checkpoint is not reached', function() {

          it('should redirect to the challenge view', function() {
            // when
            const promise = route.afterModel(assessment);

            // then
            return promise.then(() => {
              sinon.assert.calledOnce(route.replaceWith);
              sinon.assert.calledWith(route.replaceWith, 'assessments.challenge', 123, 456);
            });
          });
        });
      });

      context('when assessment is a DEMO, PLACEMENT, CERTIFICATION or PREVIEW', function() {
        beforeEach(() => {
          assessment.isPlacement = true;
        });
        it('should redirect to the challenge view', function() {
          // when
          const promise = route.afterModel(assessment);

          // then
          return promise.then(() => {
            sinon.assert.calledOnce(route.replaceWith);
            sinon.assert.calledWith(route.replaceWith, 'assessments.challenge', 123, 456);
          });
        });
      });
    });

    context('when the next challenge does not exist (is null)', function() {

      beforeEach(function() {
        queryRecordStub.resolves(null);
      });

      context('when assessment is a SMART_PLACEMENT', function() {

        beforeEach(function() {
          assessment.isSmartPlacement = true;
          assessment.isDemo = false;
          assessment.hasCheckpoints = true;
          assessment.codeCampaign = 'konami';
        });

        context('when assessment is not completed', function() {

          beforeEach(function() {
            assessment.state = 'started';
            assessment.isCompleted = false;
          });

          context('when user has seen checkpoint', function() {

            beforeEach(function() {
              route.hasSeenCheckpoint = true;
            });

            it('should redirect to campaigns.skill-review page', function() {
              // when
              const promise = route.afterModel(assessment);

              // then
              return promise.then(() => {
                sinon.assert.calledWith(route.replaceWith, 'campaigns.skill-review', 'konami', 123);
              });
            });
          });

          context('when user has not seen checkpoint', function() {

            beforeEach(function() {
              route.hasSeenCheckpoint = false;
            });

            it('should redirect to assessment last checkpoint page', function() {
              // when
              const promise = route.afterModel(assessment);

              // then
              return promise.then(() => {
                sinon.assert.calledOnce(route.replaceWith);
                sinon.assert.calledWith(route.replaceWith, 'assessments.checkpoint', 123, { queryParams: { finalCheckpoint: true, newLevel:null, competenceLeveled:null } });
              });
            });
          });
        });

        context('when assessment is completed', function() {

          beforeEach(function() {
            assessment.state = 'completed';
            assessment.isCompleted = true;
          });

          it('should redirect to campaigns.skill-review page', function() {
            // when
            route.afterModel(assessment);

            // then
            sinon.assert.calledWith(route.replaceWith, 'campaigns.skill-review', 'konami', 123);
          });
        });
      });

      context('when assessment is a CERTIFICATION', function() {
        beforeEach(() => {
          assessment.isCertification = true;
          assessment.certificationNumber = 666;
        });

        it('should redirect to certifications.results page', function() {
          // when
          const promise = route.afterModel(assessment);

          // then
          return promise.then(() => {
            sinon.assert.calledWith(route.replaceWith, 'certifications.results', 666);
          });
        });
      });

      context('when assessment is a COMPETENCE_EVALUATION', function() {
        beforeEach(() => {
          assessment.isCompetenceEvaluation = true;
        });

        it('should redirect to competences.results page', function() {
          // when
          const competenceId = 'recCompetenceId';
          const promise = route.afterModel(assessment);

          // then
          return promise.then(() => {
            sinon.assert.calledWith(route.replaceWith, 'competences.results', competenceId, 123);
          });
        });
      });

      context('when assessment is a DEMO', function() {
        it('should redirect to assessments.results page', function() {
          // when
          const promise = route.afterModel(assessment);

          // then
          return promise.then(() => {
            sinon.assert.calledWith(route.replaceWith, 'assessments.results', 123);
          });
        });
      });
    });
  });
});
