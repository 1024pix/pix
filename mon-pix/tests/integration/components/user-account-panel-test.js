import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { click, fillIn, find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

describe('Integration | Component | User account panel', () => {

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

  context('when editing e-mail', function() {
    let user;
    beforeEach(function() {
      // given
      user = {
        firstName: 'John',
        lastName: 'DOE',
        email: 'john.doe@example.net',
        username: 'john.doe0101',
      };
      this.set('user', user);
    });

    it('should display save and cancel button', async function() {
      // when
      await render(hbs`<UserAccountPanel @user={{this.user}} />`);
      await click('button[data-test-edit-email]');

      // then
      expect(find('label[for=new-email]')).to.exist;
      expect(find('input[data-test-new-email]')).to.exist;
      expect(find('button[data-test-cancel-email]')).to.exist;
      expect(find('button[data-test-submit-email]')).to.exist;
    });

    context('when the user cancel edition', function() {
      it('should not display save and cancel button and display edit button', async function() {
        // given
        await render(hbs`<UserAccountPanel @user={{this.user}} />`);
        await click('button[data-test-edit-email]');

        // when
        await click('button[data-test-cancel-email]');

        // then
        expect(find('label[for=new-email]')).to.not.exist;
        expect(find('input[data-test-new-email]')).to.not.exist;
        expect(find('button[data-test-cancel-email]')).to.not.exist;
        expect(find('button[data-test-submit-email]')).to.not.exist;
        expect(find('button[data-test-edit-email]')).to.exist;
      });
    });

    context('when the user save', function() {
      it('should call update user method and disable editing mode', async function() {
        // given
        const newEmail = 'newEmail@example.net';
        const saveStub = sinon.stub();
        saveStub.resolves();
        this.user.save = saveStub;
        await render(hbs`<UserAccountPanel @user={{this.user}} />`);

        // when
        await click('button[data-test-edit-email]');
        await fillIn('input[data-test-new-email]', newEmail);
        await click('button[data-test-submit-email]');

        // then
        sinon.assert.calledWith(saveStub, { adapterOptions: { updateEmail: true } });
        expect(find('button[data-test-edit-email]')).to.exist;
        expect(find('input[data-test-new-email]')).to.not.exist;
        expect(find('button[data-test-cancel-email]')).to.not.exist;
        expect(find('button[data-test-submit-email]')).to.not.exist;
        expect(this.user.email).to.equal(newEmail);
      });
    });
  });
});
