import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | no certification panel', function() {
  setupComponentTest('no-certification-panel', {
    integration: true
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#no-certification-panel}}
    //     template content
    //   {{/no-certification-panel}}
    // `);

    this.render(hbs`{{no-certification-panel}}`);
    expect(this.$()).to.have.length(1);
  });
});
