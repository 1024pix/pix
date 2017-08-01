import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | pix modale', function() {
  setupComponentTest('pix-modale', {
    integration: true
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#pix-modale}}
    //     template content
    //   {{/pix-modale}}
    // `);

    this.render(hbs`{{pix-modale}}`);
    expect(this.$()).to.have.length(1);
  });
});
