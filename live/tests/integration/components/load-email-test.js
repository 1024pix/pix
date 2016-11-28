/* jshint expr:true */
import { expect } from 'chai';
import {
  describeComponent,
  it
} from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describeComponent(
  'load-email',
  'Integration: LoadEmailComponent',
  {
    integration: true
  },
  function() {
    it('renders', function() {
      this.render(hbs`{{load-email}}`);
      expect(this.$()).to.have.length(1);
    });
  }
);
