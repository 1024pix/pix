import { run } from '@ember/runloop';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupModelTest } from 'ember-mocha';

describe('Unit | Model | user model', function() {
  setupModelTest('user', {
    // Specify the other units that are required for this test.
    needs: ['model:competence', 'model:organization']
  });
  // Replace this with your real tests.
  it('exists', function() {
    const model = this.subject();
    // var store = this.store();
    expect(model).to.be.ok;
  });

  describe('@fullName', () => {
    it('should concatenate user first and last name', function() {
      return run(() => {
        // given
        const model = this.subject();
        model.set('firstName', 'Manu');
        model.set('lastName', 'Phillip');

        // when
        const fullName = model.get('fullName');

        // then
        expect(fullName).to.equal('Manu Phillip');
      });
    });
  });
});
