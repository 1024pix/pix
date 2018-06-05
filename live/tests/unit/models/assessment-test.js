import { run } from '@ember/runloop';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupModelTest } from 'ember-mocha';
import { isArray } from '@ember/array';

const SMART_PLACEMENT_TYPE = 'SMART_PLACEMENT';

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
        const store = this.store();
        const assessment = store.createRecord('assessment', { type: SMART_PLACEMENT_TYPE });

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
        const store = this.store();
        const assessment = store.createRecord('assessment', { type: SMART_PLACEMENT_TYPE });

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
        const assessment = store.createRecord('assessment', { type: SMART_PLACEMENT_TYPE, answers: [answer] });

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
          type: SMART_PLACEMENT_TYPE, answers: [
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
          type: SMART_PLACEMENT_TYPE, answers: [
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

  describe('Computed property #progress', function() {

    describe('#currentStep property', function() {
      it('should start at 1', function() {
        run(() => {
          // given
          const store = this.store();
          const assessment = store.createRecord('assessment');

          // when
          const result = assessment.get('progress');

          // then
          expect(result).to.have.property('currentStep', 1);
        });
      });

      it('should be 2 if we answered once', function() {
        run(() => {
          // given
          const store = this.store();
          const answer = store.createRecord('answer', {});
          const assessment = store.createRecord('assessment', { answers: [answer] });

          // when
          const result = assessment.get('progress');

          // then
          expect(result).to.have.property('currentStep', 2);
        });
      });

      it('should be 3 if we answered twice', function() {
        run(() => {
          // given
          const store = this.store();
          const answers = [
            store.createRecord('answer', {}),
            store.createRecord('answer', {}),
          ];
          const assessment = store.createRecord('assessment', { answers });

          // when
          const result = assessment.get('progress');

          // then
          expect(result).to.have.property('currentStep', 3);
        });
      });
    });

    describe('#maxStep property', function() {

      context('when not in SMART_PLACEMENT', function() {
        it('should equal the number of challenges of the course', function() {
          run(() => {
            // given
            const store = this.store();
            const course = store.createRecord('course', { nbChallenges: 12 });
            const assessment = store.createRecord('assessment', { course });

            // when
            const result = assessment.get('progress');

            // then
            expect(result).to.have.property('maxStep', 12);
          });
        });
      });

      context('when in SMART_PLACEMENT', function() {
        it('should always equal 5', function() {
          run(() => {
            // given
            const store = this.store();
            const assessment = store.createRecord('assessment', { type: SMART_PLACEMENT_TYPE });

            // when
            const result = assessment.get('progress');

            // then
            expect(result).to.have.property('maxStep', 5);
          });
        });
      });
    });

    describe('#stepPercentage property', function() {
      it('should be the completion percentage of the two other properties', function() {
        run(() => {
          // given
          const store = this.store();
          const course = store.createRecord('course', { nbChallenges: 5 });
          const assessment = store.createRecord('assessment', { course });
          const expectedCompletionPercentage = 1 / 5 * 100; // 20%

          // when
          const result = assessment.get('progress');

          // then
          expect(result).to.have.property('stepPercentage', expectedCompletionPercentage);
        });
      });
    });
  });
});
