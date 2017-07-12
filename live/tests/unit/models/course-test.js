import Ember from 'ember';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupModelTest } from 'ember-mocha';

describe('Unit | Model | Course', function() {

  setupModelTest('course', {
    needs: ['model:assessment', 'model:challenge']
  });

  it('exists', function() {
    const model = this.subject();
    expect(model).to.be.ok;
  });

  describe('getProgress', function() {

    it('currentStep start at 1', function() {
      Ember.run(() => {
        // given
        const store = this.store();
        const challenge = store.createRecord('challenge', {});
        const course = this.subject({ challenges: [challenge] });

        expect(course.getProgress(challenge)).to.have.property('currentStep', 1);
      });
    });

    it('maxStep is 2 when there is 2 challenges in the course', function() {
      Ember.run(() => {
        // given
        const store = this.store();
        const challenge1 = store.createRecord('challenge', {});
        const challenge2 = store.createRecord('challenge', {});
        const course = this.subject({ challenges: [challenge1, challenge2] });

        expect(course.getProgress(challenge1)).to.have.property('maxStep', 2);
        expect(course.getProgress(challenge2)).to.have.property('maxStep', 2);
      });
    });

    it('currentStep is 2 when there is 2 challenges in the course and called with 2nd test', function() {
      Ember.run(() => {
        // given
        const store = this.store();
        const challenge1 = store.createRecord('challenge', {});
        const challenge2 = store.createRecord('challenge', {});
        const course = this.subject({ challenges: [challenge1, challenge2] });

        expect(course.getProgress(challenge2)).to.have.property('currentStep', 2);
      });
    });

  });
});
