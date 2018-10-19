import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe.only('Integration | Component | resume-campaign-banner', function() {
  setupComponentTest('resume-campaign-banner', {
    integration: true
  });

  it('renders', function() {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // Template block usage:
    // this.render(hbs`
    //   {{#resume-campaign-banner}}
    //     template content
    //   {{/resume-campaign-banner}}
    // `);

    this.render(hbs`{{resume-campaign-banner}}`);
    expect(this.$()).to.have.length(1);
  });
});
