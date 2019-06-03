import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import EmberObject from '@ember/object';
import EmberService from '@ember/service';
import sinon from 'sinon';

describe('Unit | Route | Assessments | Rating', function() {
  setupTest();

  let route;
  let StoreStub;
  let createRecordStub;
  const assessmentRating = EmberObject.create({});

  beforeEach(function() {
    // define stubs
    assessmentRating.save = sinon.stub().resolves();

    createRecordStub = sinon.stub().returns(assessmentRating);
    StoreStub = EmberService.extend({
      createRecord: createRecordStub,
    });

    // manage dependency injection context
    this.owner.register('service:store', StoreStub);

    route = this.owner.lookup('route:assessments.rating');
    route.replaceWith = sinon.stub();
  });

  it('exists', function() {
    expect(route).to.be.ok;
  });

  describe('#afterModel', function() {

    const challengeOne = EmberObject.create({ id: 'recChallengeOne' });
    const answerToChallengeOne = EmberObject.create({ challenge: challengeOne });

    it('should trigger an assessment rating by creating a model and saving it', async function() {
      // given
      const assessment = EmberObject.create({ answers: [] });

      // when
      await route.afterModel(assessment);

      // then
      sinon.assert.calledWithExactly(createRecordStub, 'assessment-result', { assessment });
      sinon.assert.called(assessmentRating.save);
    });

    context('when the assessment is a CERTIFICATION', function() {
      it('should redirect to the certification end page', async function() {
        // given
        const assessment = EmberObject.create({ id: 12, type: 'CERTIFICATION', answers: [answerToChallengeOne], certificationNumber: 'courseId' });

        // when
        await route.afterModel(assessment);

        // then
        sinon.assert.calledWithExactly(route.replaceWith, 'certifications.results', 'courseId');
      });
    });

    context('when the assessment is a SMART_PLACEMENT', function() {
      it('should redirect to the skill-review page', async function() {
        // given
        const assessmentId = 12;
        const assessment = EmberObject.create({ id: assessmentId, type: 'SMART_PLACEMENT', codeCampaign: 'CODE', answers: [answerToChallengeOne] });

        // when
        await route.afterModel(assessment);

        // then
        sinon.assert.calledWithExactly(route.replaceWith, 'campaigns.skill-review', 'CODE', assessmentId);
      });
    });

    context('when the assessment is a COMPETENCE_EVALUATION', function() {
      it('should redirect to the competence evaluation results page', async function() {
        // given
        const assessment = EmberObject.create({ id: 12, type: 'COMPETENCE_EVALUATION' });

        // when
        await route.afterModel(assessment);

        // then
        sinon.assert.calledWithExactly(route.replaceWith, 'competences.results', 12);
      });
    });

    context('when the assessment is not a CERTIFICATION nor SMART_PLACEMENT nor COMPETENCE_EVALUATION', function() {
      it('should redirect to the assessment results page', async function() {
        // given
        const assessment = EmberObject.create({ answers: [answerToChallengeOne] });

        // when
        await route.afterModel(assessment);

        // then
        sinon.assert.calledWithExactly(route.replaceWith, 'assessments.results', assessment.get('id'));
      });
    });
  });
});
