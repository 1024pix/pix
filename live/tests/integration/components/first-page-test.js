/* jshint expr:true */
import { expect } from 'chai';
import {
  describeComponent,
  it
} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describeComponent(
  'first-page',
  'Integration: FirstPageComponent',
  {
    integration: true
  },
  function() {
    it('renders', function() {
      this.render(hbs`{{first-page}}`);
      expect(this.$()).to.have.length(1);
    });
  }
);
