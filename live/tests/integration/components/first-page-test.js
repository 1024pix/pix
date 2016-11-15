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
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.on('myAction', function(val) { ... });
      // Template block usage:
      // this.render(hbs`
      //   {{#first-page}}
      //     template content
      //   {{/first-page}}
      // `);

      this.render(hbs`{{first-page}}`);
      expect(this.$()).to.have.length(1);
    });
  }
);
