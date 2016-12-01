import '../../test-helper';
import { expect } from 'chai';
import { describeModule, it } from 'ember-mocha';

describeModule('route:placement-tests', 'Unit | Route | placement-tests', function() {
  it('exists', function() {
    let route = this.subject();
    expect(route).to.be.ok;
  });
});


