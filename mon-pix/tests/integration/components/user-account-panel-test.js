import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe.only('Integration | Component | user account pannel', function() {
  setupIntlRenderingTest();

  it('should display firstName, lastName and email', async function() {
    // when
    await render(hbs`<UserAccountPanel />`);

    // then
    expect(find('label[aria-label="Prénom"]')).to.exist;
    expect(find('label[aria-label="Nom"]')).to.exist;
    expect(find('label[aria-label="Adresse e-mail"]')).to.exist;
  });
});
