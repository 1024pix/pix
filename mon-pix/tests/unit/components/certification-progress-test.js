import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import { A } from '@ember/array';
import EmberObject from '@ember/object';

describe('Unit | Component | certification-progress', function() {

  setupTest();

  describe('@currentAnswerNumber', () => {
    let component, assessment;

    beforeEach(function() {
      // given
      component = this.owner.lookup('component:certification-progress');
      assessment = EmberObject.create({
        answers: A([{ id: 12 }, { id: 42 }]),
        hasMany(relationship) {
          return { ids: () => { return this[relationship].mapBy('id'); } };
        },
      });
      component.set('assessment', assessment);

      // pre-compute property to check that dependencies cause recomputation
      component.get('currentAnswerNumber');
    });

    it('when answer is known, should return the matching answer number', function() {
      // when
      component.set('answerId', 12);

      // then
      expect(component.get('currentAnswerNumber')).to.equal(1);
    });

    it('when no answer exists, should return the next answer number', function() {
      // when
      component.set('answerId', undefined);

      // then
      expect(component.get('currentAnswerNumber')).to.equal(3);
    });

    it('when unsaved answer is added to the list, should ignore it', function() {
      // when
      component.set('answerId', undefined);
      assessment.get('answers').pushObject({ id: null });

      // then
      expect(component.get('currentAnswerNumber')).to.equal(3);
    });

    it('when answer list is updated, should recompute', function() {
      // when
      component.set('answerId', undefined);
      assessment.get('answers').pushObject({ id: 57 });

      // then
      expect(component.get('currentAnswerNumber')).to.equal(4);
    });

    it('when challenge ID changes, should recompute', function() {
      // when
      component.set('answerId', undefined);
      const newAnswer = EmberObject.create({ id: null });
      assessment.get('answers').pushObject(newAnswer);

      // then
      expect(component.get('currentAnswerNumber')).to.equal(3);

      // when
      newAnswer.set('id', 57);
      component.set('challengeId', 'recNewChallenge');

      // then
      expect(component.get('currentAnswerNumber')).to.equal(4);
    });
  });
});
