import { expect } from 'chai';
import { describe, it } from 'mocha';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { contains } from '../../helpers/contains';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

describe('Integration | Component | Skip Link', function() {
  setupIntlRenderingTest();

  it('displays supplied label and links to the correct anchor', async function() {
    await render(hbs`<Skiplink @href="#anchor-link" @label="go-to-link" />`);

    expect(contains('go-to-link')).to.exist;

    const skipLink = this.element.getElementsByClassName('skip-link')[0];
    expect(skipLink.href).to.contain('#anchor-link');
  });
});

