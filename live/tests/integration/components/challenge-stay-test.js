import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | challenge stay', function() {
  setupComponentTest('challenge-stay', {
    integration: true
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#challenge-stay}}
    //     template content
    //   {{/challenge-stay}}
    // `);

    this.render(hbs`{{challenge-stay}}`);
    expect(this.$()).to.have.length(1);
  });
});
