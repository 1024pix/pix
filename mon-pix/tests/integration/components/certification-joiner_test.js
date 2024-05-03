import { render } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | certification-joiner', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('submit', function () {
    test('should create certificate candidate with trimmed first and last name', async function (assert) {
      // given
      this.set('onStepChange', sinon.stub());
      const screen = await render(hbs`<CertificationJoiner @onStepChange={{this.onStepChange}}/>`);

      await _fillInputsToJoinSession({ screen, intl: this.intl });

      const store = this.owner.lookup('service:store');
      const createRecordMock = sinon.mock();
      createRecordMock.returns({ save: function () {} });
      store.createRecord = createRecordMock;

      // when
      await click(screen.getByRole('button', { name: this.intl.t('pages.certification-joiner.form.actions.submit') }));

      // then
      sinon.assert.calledWith(createRecordMock, 'certification-candidate', {
        sessionId: '123456',
        birthdate: '2000-01-02',
        firstName: 'Robert',
        lastName: 'de Pix',
      });
      assert.ok(true);
    });

    test('should create certificate candidate with padded numbers in birthday', async function (assert) {
      // given
      this.set('onStepChange', sinon.stub());
      const screen = await render(hbs`<CertificationJoiner @onStepChange={{this.onStepChange}}/>`);

      await _fillInputsToJoinSession({ screen, intl: this.intl });

      const store = this.owner.lookup('service:store');
      const createRecordMock = sinon.mock();
      createRecordMock.returns({ save: function () {} });
      store.createRecord = createRecordMock;

      // when
      await click(screen.getByRole('button', { name: this.intl.t('pages.certification-joiner.form.actions.submit') }));

      // then
      sinon.assert.calledWith(createRecordMock, 'certification-candidate', {
        sessionId: '123456',
        birthdate: '2000-01-02',
        firstName: 'Robert',
        lastName: 'de Pix',
      });
      assert.ok(true);
    });

    test('should call the stepChange action when certification candidate creation is successful', async function (assert) {
      // given
      const stepChangeStub = sinon.stub();
      this.set('onStepChange', stepChangeStub);
      const screen = await render(hbs`<CertificationJoiner @onStepChange={{this.onStepChange}}/>`);

      await _fillInputsToJoinSession({ screen, intl: this.intl });

      const store = this.owner.lookup('service:store');
      const createRecordMock = sinon.mock();
      createRecordMock.returns({
        save: function () {},
        id: '112233',
      });
      store.createRecord = createRecordMock;

      // when
      await click(screen.getByRole('button', { name: this.intl.t('pages.certification-joiner.form.actions.submit') }));

      // then
      sinon.assert.calledWith(stepChangeStub, '112233');
      assert.ok(true);
    });

    test('should display an error message if user has a language not supported by v3 certification', async function (assert) {
      // given
      this.set('onStepChange', sinon.stub());
      const screen = await render(hbs`<CertificationJoiner @onStepChange={{this.onStepChange}}/>`);

      await _fillInputsToJoinSession({ screen, intl: this.intl });

      const store = this.owner.lookup('service:store');
      const saveStub = sinon.stub();
      saveStub
        .withArgs({ adapterOptions: { joinSession: true, sessionId: '123456' } })
        .throws({ errors: [{ code: 'LANGUAGE_NOT_SUPPORTED', meta: { languageCode: 'nl' } }] });
      const createRecordMock = sinon.mock();
      createRecordMock.returns({ save: saveStub, deleteRecord: function () {} });
      store.createRecord = createRecordMock;

      // when
      await click(screen.getByRole('button', { name: this.intl.t('pages.certification-joiner.form.actions.submit') }));

      // then
      assert.ok(
        screen.getByText(
          "La certification Pix n'est pas encore disponible en Néerlandais. Les langues disponibles actuellement pour passer la certification sont : Anglais, Français.",
          { exact: false },
        ),
      );
    });

    test('should display an error message if session id contains letters', async function (assert) {
      // given
      this.set('onStepChange', sinon.stub());
      const screen = await render(hbs`<CertificationJoiner @onStepChange={{this.onStepChange}}/>`);
      const sessionIdWithLetters = '123AAA456AAA';

      await _fillInputsToJoinSession({ sessionId: sessionIdWithLetters, screen, intl: this.intl });

      const store = this.owner.lookup('service:store');
      const createRecordMock = sinon.mock();
      createRecordMock.returns({ save: function () {} });
      store.createRecord = createRecordMock;

      // when
      await click(screen.getByRole('button', { name: this.intl.t('pages.certification-joiner.form.actions.submit') }));

      // then
      assert.ok(screen.getByText('Le numéro de session est composé uniquement de chiffres.'));
    });

    test('should display an error message on student mismatch error', async function (assert) {
      // given
      this.set('onStepChange', sinon.stub());
      const screen = await render(hbs`<CertificationJoiner @onStepChange={{this.onStepChange}}/>`);

      await _fillInputsToJoinSession({ screen, intl: this.intl });

      const store = this.owner.lookup('service:store');
      const saveStub = sinon.stub();
      saveStub.withArgs({ adapterOptions: { joinSession: true, sessionId: '123456' } }).throws({
        errors: [
          {
            detail: 'Some message',
            code: 'MATCHING_RECONCILED_STUDENT_NOT_FOUND',
          },
        ],
      });
      const createRecordMock = sinon.mock();
      createRecordMock.returns({ save: saveStub, deleteRecord: function () {} });
      store.createRecord = createRecordMock;

      // when
      await click(screen.getByRole('button', { name: this.intl.t('pages.certification-joiner.form.actions.submit') }));

      // then
      assert.ok(
        screen.getByText(
          "Vous utilisez actuellement un compte qui n'est pas lié à votre établissement. Connectez vous au compte avec lequel vous avez effectué vos parcours ou demandez de l'aide au surveillant.",
        ),
      );
      assert.ok(screen.getByText("Comment trouver le compte lié à l'établissement ?"));
    });

    test('should display an error message on account mismatch error', async function (assert) {
      // given
      this.set('onStepChange', sinon.stub());
      const screen = await render(hbs`<CertificationJoiner @onStepChange={{this.onStepChange}}/>`);

      await _fillInputsToJoinSession({ screen, intl: this.intl });

      const store = this.owner.lookup('service:store');
      const saveStub = sinon.stub();
      saveStub.withArgs({ adapterOptions: { joinSession: true, sessionId: '123456' } }).throws({
        errors: [
          {
            status: '409',
            code: 'UNEXPECTED_USER_ACCOUNT',
          },
        ],
      });
      const createRecordMock = sinon.mock();
      createRecordMock.returns({ save: saveStub, deleteRecord: function () {} });
      store.createRecord = createRecordMock;

      // when
      await click(screen.getByRole('button', { name: this.intl.t('pages.certification-joiner.form.actions.submit') }));

      // then
      assert.ok(
        screen.getByText(
          'Les informations saisies correspondent à un.e candidat.e inscrit.e à la session et déjà connecté.e avec un autre compte. Vérifiez que vous êtes connecté.e au compte qui a démarré la certification.',
        ),
      );
    });

    test('should display an error message on candidate not found', async function (assert) {
      // given
      this.set('onStepChange', sinon.stub());
      const screen = await render(hbs`<CertificationJoiner @onStepChange={{this.onStepChange}}/>`);

      await _fillInputsToJoinSession({ screen, intl: this.intl });

      const store = this.owner.lookup('service:store');
      const saveStub = sinon.stub();
      saveStub
        .withArgs({ adapterOptions: { joinSession: true, sessionId: '123456' } })
        .throws({ errors: [{ detail: 'blublabli' }] });
      const createRecordMock = sinon.mock();
      createRecordMock.returns({ save: saveStub, deleteRecord: function () {} });
      store.createRecord = createRecordMock;

      // when
      await click(screen.getByRole('button', { name: this.intl.t('pages.certification-joiner.form.actions.submit') }));

      // then
      assert.ok(screen.getByText(this.intl.t('pages.certification-joiner.error-messages.generic.disclaimer')));
      assert.ok(
        screen.getByText(this.intl.t('pages.certification-joiner.error-messages.generic.check-session-number')),
      );
      assert.ok(screen.getByText(this.intl.t('pages.certification-joiner.error-messages.generic.check-personal-info')));
    });

    test('should display an error message on session not accessible', async function (assert) {
      // given
      this.set('onStepChange', sinon.stub());
      const screen = await render(hbs`<CertificationJoiner @onStepChange={{this.onStepChange}}/>`);

      await _fillInputsToJoinSession({ screen, intl: this.intl });

      const store = this.owner.lookup('service:store');
      const saveStub = sinon.stub();
      saveStub
        .withArgs({ adapterOptions: { joinSession: true, sessionId: '123456' } })
        .throws({ errors: [{ status: '412' }] });
      const createRecordMock = sinon.mock();
      createRecordMock.returns({ save: saveStub, deleteRecord: function () {} });
      store.createRecord = createRecordMock;

      // when
      await click(screen.getByRole('button', { name: this.intl.t('pages.certification-joiner.form.actions.submit') }));

      // then
      assert.ok(screen.getByText("La session que vous tentez de rejoindre n'est plus accessible."));
    });

    module('when candidate has already been linked to another user in the session', function () {
      test('should display an error message', async function (assert) {
        // given
        this.set('onStepChange', sinon.stub());
        const screen = await render(hbs`<CertificationJoiner @onStepChange={{this.onStepChange}}/>`);

        await _fillInputsToJoinSession({ screen, intl: this.intl });

        const store = this.owner.lookup('service:store');
        const saveStub = sinon.stub();
        saveStub
          .withArgs({ adapterOptions: { joinSession: true, sessionId: '123456' } })
          .throws({ errors: [{ status: '404' }] });
        const createRecordMock = sinon.mock();
        createRecordMock.returns({ save: saveStub, deleteRecord: function () {} });
        store.createRecord = createRecordMock;

        // when
        await click(
          screen.getByRole('button', { name: this.intl.t('pages.certification-joiner.form.actions.submit') }),
        );

        // then
        assert.ok(screen.getByText(this.intl.t('pages.certification-joiner.error-messages.generic.disclaimer')));
        assert.ok(
          screen.getByText(this.intl.t('pages.certification-joiner.error-messages.generic.check-session-number')),
        );
        assert.ok(
          screen.getByText(this.intl.t('pages.certification-joiner.error-messages.generic.check-personal-info')),
        );
      });
    });
  });

  test('should display hint on session number input', async function (assert) {
    // given & when
    const screen = await render(hbs`<CertificationJoiner @onStepChange={{this.onStepChange}}/>`);

    // then
    assert.ok(screen.getByText(this.intl.t('pages.certification-joiner.form.fields.session-number-information')));
  });

  module('when filling form', function () {
    module('should not allow filling letters in birth date', function () {
      test('day', async function (assert) {
        // given
        this.set('onStepChange', sinon.stub());
        const screen = await render(hbs`<CertificationJoiner @onStepChange={{this.onStepChange}}/>`);
        const birthDayInput = screen.getByRole('spinbutton', {
          name: `${this.intl.t('pages.certification-joiner.form.fields.birth-date')} ${this.intl.t(
            'pages.certification-joiner.form.fields.birth-day',
          )}`,
        });

        // when
        await fillIn(birthDayInput, 'aa');

        // then
        assert.notOk(birthDayInput.value.includes('aa'));
      });

      test('month', async function (assert) {
        // given
        this.set('onStepChange', sinon.stub());
        const screen = await render(hbs`<CertificationJoiner @onStepChange={{this.onStepChange}}/>`);
        const birthMonthInput = screen.getByRole('spinbutton', {
          name: this.intl.t('pages.certification-joiner.form.fields.birth-month'),
        });

        // when
        await fillIn(birthMonthInput, 'aa');

        // then
        assert.notOk(birthMonthInput.value.includes('aa'));
      });

      test('year', async function (assert) {
        // given
        this.set('onStepChange', sinon.stub());
        const screen = await render(hbs`<CertificationJoiner @onStepChange={{this.onStepChange}}/>`);
        const birthYearInput = screen.getByRole('spinbutton', {
          name: this.intl.t('pages.certification-joiner.form.fields.birth-year'),
        });

        // when
        await fillIn(birthYearInput, 'aa');

        // then
        assert.notOk(birthYearInput.value.includes('aa'));
      });
    });
  });

  async function _fillInputsToJoinSession({ sessionId = '123456', screen, intl }) {
    await fillIn(
      screen.getByRole('textbox', {
        name: 'Numéro de session Communiqué uniquement par le surveillant en début de session',
      }),
      sessionId,
    );
    await fillIn(
      screen.getByRole('textbox', { name: intl.t('pages.certification-joiner.form.fields.first-name') }),
      'Robert' + '  ',
    );
    await fillIn(
      screen.getByRole('textbox', { name: intl.t('pages.certification-joiner.form.fields.birth-name') }),
      '  ' + 'de Pix',
    );
    await fillIn(
      screen.getByRole('spinbutton', {
        name: `${intl.t('pages.certification-joiner.form.fields.birth-date')} ${intl.t(
          'pages.certification-joiner.form.fields.birth-day',
        )}`,
      }),
      '02',
    );
    await fillIn(
      screen.getByRole('spinbutton', { name: intl.t('pages.certification-joiner.form.fields.birth-month') }),
      '01',
    );
    await fillIn(
      screen.getByRole('spinbutton', { name: intl.t('pages.certification-joiner.form.fields.birth-year') }),
      '2000',
    );
  }
});
