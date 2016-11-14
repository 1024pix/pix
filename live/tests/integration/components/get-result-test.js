/* jshint expr:true */
import { expect } from 'chai';
import {
  describeComponent,
  it
} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describeComponent(
  'get-result',
  'Integration: GetResultComponent',
  {
    integration: true
  },
  function() {
    it('renders', function() {
      this.render(hbs`{{get-result}}`);
      expect(this.$()).to.have.length(1);
    });
  }
);
