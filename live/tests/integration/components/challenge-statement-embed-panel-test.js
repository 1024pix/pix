import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | challenge statement embed panel', function() {
  setupComponentTest('challenge-statement-embed-panel', {
    integration: true
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#challenge-statement-embed-panel}}
    //     template content
    //   {{/challenge-statement-embed-panel}}
    // `);

    this.render(hbs`{{challenge-statement-embed-panel}}`);
    expect(this.$()).to.have.length(1);
  });
});
