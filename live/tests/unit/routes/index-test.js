import '../../test-helper';
import { expect } from 'chai';
import { describeModule, it } from 'ember-mocha';

describeModule('route:index', 'Unit | Route | index', function() {
  it("exists", function() {
    let route = this.subject();
    expect(route).to.be.ok;
  });
});


