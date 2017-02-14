import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupModelTest } from 'ember-mocha';

describe('Unit | Model | feedback', function () {

  setupModelTest('feedback', {
    needs: ['model:assessment', 'model:challenge']
  });

  it('exists', function () {
    const model = this.subject();
    expect(model).to.be.ok;
  });

});
