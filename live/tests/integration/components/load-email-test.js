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
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.on('myAction', function(val) { ... });
      // Template block usage:
      // this.render(hbs`
      //   {{#load-email}}
      //     template content
      //   {{/load-email}}
      // `);

      this.render(hbs`{{load-email}}`);
      expect(this.$()).to.have.length(1);
    });
  }
);
