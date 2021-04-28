import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Routes | routes/login-or-register', function() {

  setupIntlRenderingTest();
  beforeEach(function() {
    this.set('toggleFormsVisibility', '');
  });

  it('should render', async function() {
    // when
    await render(hbs`{{routes/login-or-register toggleFormsVisibility=toggleFormsVisibility}}`);

    // then
    expect(find('.login-or-register')).to.exist;
  });

  it('should display the organization name the user is invited to', async () => {
    // when
    await render(hbs`{{routes/login-or-register organizationName='Organization Aztec' toggleFormsVisibility=toggleFormsVisibility}}`);

    // then
    expect(find('.login-or-register-panel__invitation').textContent)
      .to.equal('Organization Aztec vous invite à rejoindre Pix');
  });

});
