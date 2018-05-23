import { run } from '@ember/runloop';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupModelTest } from 'ember-mocha';

describe('Unit | Model | Assessment', function() {

  setupModelTest('assessment', {
    needs: ['model:course', 'model:answer']
  });

  it('exists', function() {
    const model = this.subject();
    expect(model).to.be.ok;
  });

  describe('Computed property #hasAttachment', function() {

    it('Should be true when challenge has at least one attachment file', function() {
      run(() => {
        // given
        const store = this.store();
        const assessment = store.createRecord('assessment', { type: 'SMART_PLACEMENT' });

        // when
        const hasCheckpoints = assessment.get('hasCheckpoints');

        // then
        expect(hasCheckpoints).to.be.true;
      });

    });

    it('Should be false when assessment has multiple attachment files', function() {
      run(() => {
        // given
        const store = this.store();
        const assessment = store.createRecord('assessment', { type: 'DEMO' });

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
        const store = this.store();
        const assessment = store.createRecord('assessment', { type: 'SMART_PLACEMENT' });

        // when
        const answersSinceLastCheckpoints = assessment.get('answersSinceLastCheckpoints');

        // then
        expect(answersSinceLastCheckpoints).to.deep.equal([]);
      });

    });

    it('should return answers', function() {
      run(() => {
        // given
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
});
