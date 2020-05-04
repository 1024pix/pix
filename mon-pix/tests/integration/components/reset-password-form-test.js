import EmberObject from '@ember/object';
import { resolve, reject } from 'rsvp';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import {
  click,
  find,
  fillIn,
  render,
  triggerEvent
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const PASSWORD_INPUT_CLASS = '.form-textfield__input';

describe('Integration | Component | reset password form', function() {
  setupRenderingTest();

  describe('Component rendering', function() {

    it('should be rendered', async function() {
      await render(hbs`{{reset-password-form}}`);
      expect(find('.sign-form__container')).to.exist;
    });

    describe('When component is rendered,', function() {

      [
        { item: '.pix-logo__link' },
        { item: '.sign-form-title' },
        { item: '.sign-form-header__instruction' },
        { item: '.sign-form__body' },
        { item: '.form-textfield__label' },
        { item: '.form-textfield__input-field-container' },
        { item: '.button' }
      ].forEach(({ item }) => {
        it(`should contains a item with class: ${item}`, async function() {
          // when
          await render(hbs`{{reset-password-form}}`);

          // then
          expect(find(item)).to.exist;
        });
      });

      it('should display user’s fullName', async function() {
        // given
        const user = { fullName: 'toto riri' };
        this.set('user', user);

        // when
        await render(hbs`{{reset-password-form user=user}}`);

        // then
        expect(find('.sign-form-title').textContent.trim()).to.equal(user.fullName);
      });

    });

    describe('A submit button', () => {

      it('should be rendered', async function() {
        // when
        await render(hbs`{{reset-password-form}}`);

        // then
        expect(find('.button')).to.exist;
      });

      describe('Saving behavior', function() {

        let isSaveMethodCalled, saveMethodOptions;

        const save = (options) => {
          isSaveMethodCalled = true;
          saveMethodOptions = options;
          return resolve();
        };

        const saveWithRejection = () => {
          isSaveMethodCalled = true;
          return reject();
        };

        beforeEach(function() {
          isSaveMethodCalled = false;
        });

        it('should save the new password, when button is clicked', async function() {
          // given
          const user = EmberObject.create({ firstName: 'toto', lastName: 'riri', save });
          this.set('user', user);
          this.set('temporaryKey', 'temp-key');
          const validPassword = 'Pix 1 2 3!';

          await render(hbs `{{reset-password-form user=user temporaryKey=temporaryKey}}`);

          // when
          await fillIn(PASSWORD_INPUT_CLASS, validPassword);
          await triggerEvent(PASSWORD_INPUT_CLASS, 'change');

          await click('.button');

          // then
          expect(isSaveMethodCalled).to.be.true;
          expect(saveMethodOptions).to.eql({ adapterOptions: { updatePassword: true, temporaryKey: 'temp-key' } });
          expect(this.user.password).to.eql(null);
          expect(find(PASSWORD_INPUT_CLASS)).to.not.exist;
          expect(find('.password-reset-demand-form__body')).to.exist;
        });

        it('should get an error, when button is clicked and saving return error', async function() {
          // given
          const user = EmberObject.create({ firstName: 'toto', lastName: 'riri', save: saveWithRejection });
          this.set('user', user);
          const validPassword = 'Pix 1 2 3!';

          await render(hbs `{{reset-password-form user=user}}`);

          // when
          await fillIn(PASSWORD_INPUT_CLASS, validPassword);
          await triggerEvent(PASSWORD_INPUT_CLASS, 'change');

          await click('.button');

          // then
          expect(isSaveMethodCalled).to.be.true;
          expect(this.user.password).to.eql(validPassword);
          expect(find(PASSWORD_INPUT_CLASS).value).to.equal(validPassword);
          expect(find('.form-textfield__message--error')).to.exist;
        });

      });

    });

  });

});

