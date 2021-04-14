import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { contains } from '../../helpers/contains';

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
    expect(contains(user.firstName)).to.exist;
    expect(contains(user.lastName)).to.exist;
    expect(contains('Français')).to.exist;
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
