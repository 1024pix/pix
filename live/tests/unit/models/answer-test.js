import { run } from '@ember/runloop';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupModelTest } from 'ember-mocha';

describe('Unit | Model | Answer', function() {

  setupModelTest('answer', {
    needs: ['model:assessment', 'model:challenge']
  });

  it('exists', function() {
    const model = this.subject();
    // var store = this.store();
    expect(model).to.be.ok;
  });

  describe('isResultOk', function() {

    it('should return true when answser.result is ok', function() {
      // given
      const store = this.store();
      const answer = run(() => store.createRecord('answer', { 'result': 'ok' }));

      // when
      const result = answer.get('isResultOk');

      expect(result).to.be.true;
    });

    it('should return false when answser.result is ko', function() {
      // given
      const store = this.store();
      const answer = run(() => store.createRecord('answer', { 'result': 'ko' }));

      // when
      const result = answer.get('isResultOk');

      expect(result).to.be.false;
    });
  });
  describe('isResultNotOk', function() {

    it('should return true when answser.result is ok', function() {
      // given
      const store = this.store();
      const answer = run(() => store.createRecord('answer', { 'result': 'ok' }));

      // when
      const result = answer.get('isResultNotOk');

      expect(result).to.be.false;
    });

    it('should return false when answser.result is ko', function() {
      // given
      const store = this.store();
      const answer = run(() => store.createRecord('answer', { 'result': 'ko' }));

      // when
      const result = answer.get('isResultNotOk');

      expect(result).to.be.true;
    });
  });
});
