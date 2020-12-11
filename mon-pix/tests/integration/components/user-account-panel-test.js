import { expect } from 'chai';
import sinon from 'sinon';
import { describe, it, beforeEach } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { click, fillIn, find, render } from '@ember/test-helpers';
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

  context('when user does have an email', function() {

    let user;

    beforeEach(function() {
      // given
      user = {
        firstName: 'John',
        lastName: 'DOE',
        username: 'john.doe0101',
        email: 'john.doe@example.net',
        save: sinon.stub(),
      };
      this.set('user', user);
    });

    it('should display a modify button', async function() {
      // when
      await render(hbs`<UserAccountPanel @user={{this.user}} />`);

      // then
      expect(find('button[data-test-modify-button]')).to.exist;

    });

    context('When modify button is clicked', () => {

      beforeEach(async () => {
        // given
        await render(hbs`<UserAccountPanel @user={{this.user}} />`);
        await click('button[data-test-modify-button]');
      });

      it('should display an input field', async function() {
        // then
        expect(find('input[data-test-modify-email-input]')).to.exist;
      });

      it('should display a save button', async function() {
        // then
        expect(find('button[data-test-save-button]')).to.exist;
      });

      it('should display a cancel button', async function() {
        // then
        expect(find('button[data-test-cancel-button]')).to.exist;
      });

      it('should hide input field when cancel button is clicked', async function() {
        // when
        await click('button[data-test-cancel-button]');

        // then
        expect(find('input[data-test-modify-email-input]')).to.not.exist;
      });

      it('should call user save function when save button is clicked', async function() {
        // when
        await fillIn('input', 'new_email@example.net');
        await click('button[data-test-save-button]');

        // then
        sinon.assert.called(user.save);
      });

      it('should not call user save function when email is not valid', async function() {
        // when
        await fillIn('input', 'not_valid');
        await click('button[data-test-save-button]');

        // then
        sinon.assert.notCalled(user.save);
      });
    });
  });

  context('when user does not have an email', function() {

    it('should not display a modify button', async function() {
      // given
      const user = {
        firstName: 'John',
        lastName: 'DOE',
        username: 'john.doe0101',
      };
      this.set('user', user);

      // when
      await render(hbs`<UserAccountPanel @user={{this.user}} />`);

      // then
      expect(find('button[data-test-modify-button]')).to.not.exist;
    });
  });
});
