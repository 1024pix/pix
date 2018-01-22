import EmberObject from '@ember/object';
import { resolve, reject } from 'rsvp';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

const PASSWORD_INPUT_CLASS = '.form-textfield__input';

describe('Integration | Component | reset password form', function() {
  setupComponentTest('reset-password-form', {
    integration: true
  });

  describe('Component rendering', function() {

    it('should be rendered', function() {
      this.render(hbs`{{reset-password-form}}`);
      expect(this.$()).to.have.length(1);
    });

    describe('When component is rendered,', function() {

      [
        { item: '.reset-password-form' },
        { item: '.reset-password-form__heading' },
        { item: '.reset-password-form__user-details' },
        { item: '.reset-password-form__instruction' },
        { item: '.reset-password-form__password-textfield-container' },
        { item: '.form-textfield__label' },
        { item: '.reset-password__textfield' },
        { item: '.form-textfield__input-field-container ' }
      ].forEach(({ item }) => {
        it(`should contains  a item with class: ${item}`, function() {
          // when
          this.render(hbs`{{reset-password-form}}`);

          // then
          expect(this.$(item)).to.have.lengthOf(1);
        });
      });

      it('should display user’s fullName', function() {
        // given
        const user = { fullName: 'toto riri' };
        this.set('user', user);

        // when
        this.render(hbs`{{reset-password-form user=user}}`);

        // then
        expect(this.$('.reset-password-form__user-details').text().trim()).to.equal(user.fullName);
      });

    });

    describe('A submit button', () => {

      it('should be rendered', function() {
        // when
        this.render(hbs`{{reset-password-form}}`);

        // then
        expect(this.$('.reset-password-form__submit-button')).to.have.lengthOf(1);
      });

      describe('Saving behavior', function() {

        let isSaveMethodCalled;

        const save = () => {
          isSaveMethodCalled = true;
          return resolve();
        };

        const saveWithRejection = () => {
          isSaveMethodCalled = true;
          return reject();
        };

        beforeEach(function() {
          isSaveMethodCalled = false;
        });

        it('should save the new password, when button is clicked', function() {
          // given
          const user = EmberObject.create({ firstName: 'toto', lastName: 'riri', save });
          this.set('user', user);
          const validPassword = 'Pix 1 2 3!';

          this.render(hbs `{{reset-password-form user=user}}`);

          // when
          this.$(PASSWORD_INPUT_CLASS).val(validPassword);
          this.$(PASSWORD_INPUT_CLASS).change();

          this.$('.reset-password-form__submit-button').click();

          // then
          return wait().then(() => {
            expect(isSaveMethodCalled).to.be.true;
            expect(this.get('user.password')).to.eql(null);
            expect(this.$(PASSWORD_INPUT_CLASS).val()).to.equal('');
            expect(this.$('.form-textfield__message--success')).to.have.lengthOf(1);
          });
        });

        it('should get an error, when button is clicked and saving return error', function() {
          // given
          const user = EmberObject.create({ firstName: 'toto', lastName: 'riri', save: saveWithRejection });
          this.set('user', user);
          const validPassword = 'Pix 1 2 3!';

          this.render(hbs `{{reset-password-form user=user}}`);

          // when
          this.$(PASSWORD_INPUT_CLASS).val(validPassword);
          this.$(PASSWORD_INPUT_CLASS).change();

          this.$('.reset-password-form__submit-button').click();

          // then
          return wait().then(() => {
            expect(isSaveMethodCalled).to.be.true;
            expect(this.get('user.password')).to.eql(validPassword);
            expect(this.$(PASSWORD_INPUT_CLASS).val()).to.equal(validPassword);
            expect(this.$('.form-textfield__message--error')).to.have.lengthOf(1);
          });
        });

      });

    });

  });

});

