import { expect } from 'chai';
import { run } from '@ember/runloop';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import _ from 'lodash';

describe('Unit | Model | Assessment', function() {
  setupTest();

  let store;

  beforeEach(function() {
    store = this.owner.lookup('service:store');
  });

  describe('@answersSinceLastCheckpoints', function() {

    function newAnswers(store, nbAnswers) {
      return run(() => {
        return _.times(nbAnswers, () => store.createRecord('answer'));
      });
    }

    it('should return an empty array when no answers has been given', function() {
      // given
      const assessment = store.createRecord('assessment');
      assessment.set('answers', []);

      // when
      const answersSinceLastCheckpoints = assessment.get('answersSinceLastCheckpoints');

      // then
      expect(answersSinceLastCheckpoints).to.deep.equal([]);
    });

    it('should return the one answer when only one answer has been given', function() {
      // given
      const answer = run(() => store.createRecord('answer'));
      const assessment = store.createRecord('assessment');
      const answers = [answer];
      run(() => assessment.set('answers', answers));

      // when
      const answersSinceLastCheckpoints = assessment.get('answersSinceLastCheckpoints');

      // then
      expect(answersSinceLastCheckpoints).to.deep.equal(answers);
    });

    it('should return the last 2 answers when there is 7 answers', function() {
      // given
      const answers = newAnswers(store, 7);
      const [answer6, answer7] = answers.slice(5);
      const assessment = store.createRecord('assessment');
      run(() => assessment.set('answers', answers));

      // when
      const answersSinceLastCheckpoints = assessment.get('answersSinceLastCheckpoints');

      // then
      expect(answersSinceLastCheckpoints).to.deep.equal([answer6, answer7]);
    });

    it('should return the last 5 answers when there is 10 answers', function() {
      // given
      const answers = newAnswers(store, 10);
      const [answer6, answer7, answer8, answer9, answer10] = answers.slice(5);
      const assessment = store.createRecord('assessment');
      run(() => assessment.set('answers', answers));

      // when
      const answersSinceLastCheckpoints = assessment.get('answersSinceLastCheckpoints');

      // then
      expect(answersSinceLastCheckpoints).to.deep.equal([answer6, answer7, answer8, answer9, answer10]);
    });

    it('should return the last 1 answer when there is 11 answers', function() {
      // given
      const answers = newAnswers(store, 11);
      const answer11 = answers[10];
      const assessment = store.createRecord('assessment');
      run(() => assessment.set('answers', answers));

      // when
      const answersSinceLastCheckpoints = assessment.get('answersSinceLastCheckpoints');

      // then
      expect(answersSinceLastCheckpoints).to.deep.equal([answer11]);
    });
  });

  describe('#isSmartPlacement', function() {
    it('should return true when the assessment type is a smart placement', function() {
      // given
      const model = store.createRecord('assessment');

      // when
      model.set('type', 'SMART_PLACEMENT');

      //then
      expect(model.isSmartPlacement).to.be.true;
    });
    it('should return false when the assessment type is not a smart placement', function() {
      // given
      const model = store.createRecord('assessment');

      // when
      model.set('type', '_');

      //then
      expect(model.isSmartPlacement).to.be.false;
    });
  });

  describe('#isCertification', function() {
    it('should return true when the assessment type is a certification', function() {
      // given
      const model = store.createRecord('assessment');

      // when
      model.set('type', 'CERTIFICATION');

      //then
      expect(model.isCertification).to.be.true;
    });
    it('should return false when the assessment type is not a certification', function() {
      // given
      const model = store.createRecord('assessment');

      // when
      model.set('type', '_');

      //then
      expect(model.isCertification).to.be.false;
    });
  });

  describe('#isDemo', function() {
    it('should return true when the assessment type is demo', function() {
      // given
      const model = store.createRecord('assessment');

      // when
      model.set('type', 'DEMO');

      //then
      expect(model.isDemo).to.be.true;
    });
    it('should return false when the assessment type is not demo', function() {
      // given
      const model = store.createRecord('assessment');

      // when
      model.set('type', '_');

      //then
      expect(model.isDemo).to.be.false;
    });
  });

  describe('#isPreview', function() {
    it('should return true when the assessment type is placement', function() {
      // given
      const model = store.createRecord('assessment');

      // when
      model.set('type', 'PREVIEW');

      //then
      expect(model.isPreview).to.be.true;
    });
    it('should return false when the assessment type is not placement', function() {
      // given
      const model = store.createRecord('assessment');

      // when
      model.set('type', '_');

      //then
      expect(model.isPreview).to.be.false;
    });
  });
});
