import { run } from '@ember/runloop';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupModelTest } from 'ember-mocha';
import { isArray } from '@ember/array';

describe('Unit | Model | Assessment', function() {

  setupModelTest('assessment', {
    needs: ['model:course', 'model:challenge', 'model:answer', 'model:assessment-result']
  });

  it('exists', function() {
    const model = this.subject();
    expect(model).to.be.ok;
  });

  describe('Computed property #hasCheckpoints', function() {

    it('Should be true when challenge is a SMART_PLACEMENT', function() {
      run(() => {
        // given
        const assessment = this.subject();
        assessment.set('type', 'SMART_PLACEMENT');

        // when
        const hasCheckpoints = assessment.get('hasCheckpoints');

        // then
        expect(hasCheckpoints).to.be.true;
      });
    });

    it('Should be true when challenge is NOT a SMART_PLACEMENT', function() {
      run(() => {
        // given
        const assessment = this.subject();
        assessment.set('type', 'DEMO');

        // when
        const hasCheckpoints = assessment.get('hasCheckpoints');

        // then
        expect(hasCheckpoints).to.be.false;
      });
    });

  });

  describe('Computed property #answersSinceLastCheckpoints', function() {

    it('should be an array', function() {
      run(() => {
        // given
        const assessment = this.subject();
        assessment.set('type', 'SMART_PLACEMENT');

        // when
        const answersSinceLastCheckpoints = assessment.get('answersSinceLastCheckpoints');

        // then
        expect(isArray(answersSinceLastCheckpoints)).to.be.true;
      });

    });

    it('should return answers', function() {
      run(() => {
        const store = this.store();
        const answer = store.createRecord('answer', {});
        const assessment = store.createRecord('assessment', { type: 'SMART_PLACEMENT', answers: [answer] });

        // when
        const answersSinceLastCheckpoints = assessment.get('answersSinceLastCheckpoints');

        // then
        expect(answersSinceLastCheckpoints).to.deep.equal([answer]);
      });
    });

    it('should only return the last answers', function() {
      run(() => {
        // given
        const store = this.store();
        const answer1 = store.createRecord('answer', {});
        const answer2 = store.createRecord('answer', {});
        const answer3 = store.createRecord('answer', {});
        const answer4 = store.createRecord('answer', {});
        const answer5 = store.createRecord('answer', {});
        const answer6 = store.createRecord('answer', {});
        const answer7 = store.createRecord('answer', {});
        const assessment = store.createRecord('assessment', {
          type: 'SMART_PLACEMENT', answers: [
            answer1,
            answer2,
            answer3,
            answer4,
            answer5,
            answer6,
            answer7]
        });

        // when
        const answersSinceLastCheckpoints = assessment.get('answersSinceLastCheckpoints');

        // then
        expect(answersSinceLastCheckpoints).to.deep.equal([answer6, answer7]);
      });
    });

    it('should only return the last 5 answers', function() {
      run(() => {
        // given
        const store = this.store();
        const answer1 = store.createRecord('answer', {});
        const answer2 = store.createRecord('answer', {});
        const answer3 = store.createRecord('answer', {});
        const answer4 = store.createRecord('answer', {});
        const answer5 = store.createRecord('answer', {});
        const answer6 = store.createRecord('answer', {});
        const answer7 = store.createRecord('answer', {});
        const answer8 = store.createRecord('answer', {});
        const answer9 = store.createRecord('answer', {});
        const answer10 = store.createRecord('answer', {});
        const assessment = store.createRecord('assessment', {
          type: 'SMART_PLACEMENT', answers: [
            answer1, answer2, answer3, answer4,
            answer5, answer6, answer7, answer8,
            answer9, answer10
          ]
        });

        // when
        const answersSinceLastCheckpoints = assessment.get('answersSinceLastCheckpoints');

        // then
        expect(answersSinceLastCheckpoints).to.deep.equal([answer6, answer7, answer8, answer9, answer10]);
      });
    });
  });
})
;
