import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | user account panel', () => {

  setupIntlRenderingTest();

  it('should display values', async function() {

    // given
    const user = {
      firstName: 'John',
      lastName: 'DOE',
      email: 'john.doe@example.net',
      username: 'john.doe0101',
    };
    this.set('user', user);

    // when
    await render(hbs`<UserAccountPanel @user={{this.user}} />`);

    // then
    expect(find('span[data-test-firstName]').textContent).to.include(user.firstName);
    expect(find('span[data-test-lastName]').textContent).to.include(user.lastName);
    expect(find('span[data-test-email]').textContent).to.include(user.email);
    expect(find('span[data-test-username]').textContent).to.include(user.username);
  });

  context('when user does not have a username', function() {

    it('should not display username', async function() {

      // given
      const user = {};
      this.set('user', user);

      // when
      await render(hbs`<UserAccountPanel @user={{this.user}} />`);

      // then
      expect(find('span[data-test-username]')).to.not.exist;
    });
  });

});
