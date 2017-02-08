import { expect } from 'chai';
import { describeModule, it } from 'ember-mocha';

describeModule(
  'adapter:solution',
  'Unit | Adapter | solution',
  {},
  function() {
    // Replace this with your real tests.
    it('exists', function() {
      const adapter = this.subject();
      expect(adapter).to.be.ok;
    });
  }
);
