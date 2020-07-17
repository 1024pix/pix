import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntegration from '../../../helpers/setup-integration';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Routes | routes/login-or-register', () => {

  setupIntegration();

  it('should render', async () => {
    // when
    await render(hbs`{{routes/login-or-register}}`);

    // then
    expect(find('.login-or-register')).to.exist;
  });

  it('should display the organization name the user is invited to', async () => {
    // when
    await render(hbs`{{routes/login-or-register organizationName='Organization Aztec'}}`);

    // then
    expect(find('.login-or-register-panel__invitation').textContent)
      .to.equal('Organization Aztec vous invite à rejoindre Pix');
  });

});
