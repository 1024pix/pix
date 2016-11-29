/* jshint expr:true */
import { expect } from 'chai';
import {
  describeModule,
  it
} from 'ember-mocha';

describeModule(
  'service:delay',
  'DelayService',
  {
    // Specify the other units that are required for this test.
    // needs: ['service:foo']
  },
  function() {
    // Replace this with your real tests.
    it('exists', function() {
      let service = this.subject();
      expect(service).to.be.ok;
    });

    it('has delay#ms() which return a promise', function () {
      let delay = this.subject();
      expect(delay).to.respondsTo('ms');
      let promise = delay.ms(0);
      expect(promise).to.respondsTo('then');
    });
  }
);
