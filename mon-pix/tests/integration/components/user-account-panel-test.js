import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, render, click } from '@ember/test-helpers';
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
      lang: 'fr',
    };
    this.set('user', user);

    class UrlStub extends Service {
      get isFrenchDomainExtension() {
        return false;
      }
    }
    this.owner.register('service:url', UrlStub);

    // when
    await render(hbs`<UserAccountPanel @user={{this.user}} />`);

    // then
    expect(find('span[data-test-firstName]').textContent).to.include(user.firstName);
    expect(find('span[data-test-lastName]').textContent).to.include(user.lastName);
    expect(find('span[data-test-email]').textContent).to.include(user.email);
    expect(find('span[data-test-username]').textContent).to.include(user.username);
    expect(find('select[data-test-lang] > option[selected]').textContent).to.include('Français');
  });

  it('should call Enable Email Edition method', async function() {
    // given
    const enableEmailEditionMode = sinon.stub();
    this.set('enableEmailEditionMode', enableEmailEditionMode);
    await render(hbs`<UserAccountPanel @enableEmailEditionMode={{this.enableEmailEditionMode}} />`);

    // when
    await click('button[data-test-edit-email]');

    // then
    sinon.assert.called(enableEmailEditionMode);
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

  context('when domain is pix.fr', function() {

    it('should not display language selector', async function() {
      // given
      const user = {};

      class UrlStub extends Service {
        get isFrenchDomainExtension() {
          return true;
        }
      }
      this.set('user', user);
      this.owner.register('service:url', UrlStub);

      // when
      await render(hbs`<UserAccountPanel @user={{this.user}} />`);

      // then
      expect(find('select[data-test-lang]')).to.not.exist;
    });
  });

  context('when domain is pix.org', function() {

    it('should display language selector', async function() {
      // given
      const user = {};

      class UrlStub extends Service {
        get isFrenchDomainExtension() {
          return false;
        }
      }
      this.set('user', user);
      this.owner.register('service:url', UrlStub);

      // when
      await render(hbs`<UserAccountPanel @user={{this.user}} />`);

      // then
      expect(find('select[data-test-lang]')).to.exist;
    });
  });
});
