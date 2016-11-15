/* jshint expr:true */
import { expect } from 'chai';
import {
  describeComponent,
  it
} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describeComponent(
  'corner-ribbon',
  'Integration: CornerRibbonComponent',
  {
    integration: true
  },
  function() {
    it('renders', function() {
      this.render(hbs`{{corner-ribbon}}`);
      expect(this.$()).to.have.length(1);
    });
  }
);
