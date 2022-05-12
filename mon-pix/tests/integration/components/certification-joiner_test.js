import { expect } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { contains } from '../../helpers/contains';
import { fillInByLabel } from '../../helpers/fill-in-by-label';
import { clickByLabel } from '../../helpers/click-by-label';

describe('Integration | Component | certification-joiner', function () {
  setupIntlRenderingTest();

  context('submit', function () {
    it('should create certificate candidate with trimmed first and last name', async function () {
      // given
      this.set('onStepChange', sinon.stub());
      await render(hbs`<CertificationJoiner @onStepChange={{this.onStepChange}}/>`);
      await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.session-number'), '123456');
      await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.first-name'), 'Robert' + '  ');
      await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.birth-name'), '  ' + 'de Pix');
      await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.birth-day'), '02');
      await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.birth-month'), '01');
      await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.birth-year'), '2000');
      const store = this.owner.lookup('service:store');
      const createRecordMock = sinon.mock();
      createRecordMock.returns({ save: function () {} });
      store.createRecord = createRecordMock;

      // when
      await clickByLabel(this.intl.t('pages.certification-joiner.form.actions.submit'));

      // then
      sinon.assert.calledWith(createRecordMock, 'certification-candidate', {
        sessionId: '123456',
        birthdate: '2000-01-02',
        firstName: 'Robert',
        lastName: 'de Pix',
      });
    });

    it('should create certificate candidate with padded numbers in birthday', async function () {
      // given
      this.set('onStepChange', sinon.stub());
      await render(hbs`<CertificationJoiner @onStepChange={{this.onStepChange}}/>`);
      await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.session-number'), '123456');
      await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.first-name'), 'Robert  ');
      await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.birth-name'), '  de Pix');
      await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.birth-day'), '2');
      await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.birth-month'), '1');
      await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.birth-year'), '2000');
      const store = this.owner.lookup('service:store');
      const createRecordMock = sinon.mock();
      createRecordMock.returns({ save: function () {} });
      store.createRecord = createRecordMock;

      // when
      await clickByLabel(this.intl.t('pages.certification-joiner.form.actions.submit'));

      // then
      sinon.assert.calledWith(createRecordMock, 'certification-candidate', {
        sessionId: '123456',
        birthdate: '2000-01-02',
        firstName: 'Robert',
        lastName: 'de Pix',
      });
    });

    it('should call the stepChange action when certification candidate creation is successful', async function () {
      // given
      const stepChangeStub = sinon.stub();
      this.set('onStepChange', stepChangeStub);
      await render(hbs`<CertificationJoiner @onStepChange={{this.onStepChange}}/>`);
      await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.session-number'), '123456');
      await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.first-name'), 'Robert  ');
      await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.birth-name'), '  de Pix');
      await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.birth-day'), '2');
      await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.birth-month'), '1');
      await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.birth-year'), '2000');
      const store = this.owner.lookup('service:store');
      const createRecordMock = sinon.mock();
      createRecordMock.returns({
        save: function () {},
        id: '112233',
      });
      store.createRecord = createRecordMock;

      // when
      await clickByLabel(this.intl.t('pages.certification-joiner.form.actions.submit'));

      // then
      sinon.assert.calledWith(stepChangeStub, '112233');
    });

    it('should display an error message if session id contains letters', async function () {
      // given
      this.set('onStepChange', sinon.stub());
      await render(hbs`<CertificationJoiner @onStepChange={{this.onStepChange}}/>`);
      await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.session-number'), '123AAA456AAA');
      await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.first-name'), 'Robert');
      await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.birth-name'), 'de Pix');
      await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.birth-day'), '02');
      await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.birth-month'), '01');
      await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.birth-year'), '2000');
      const store = this.owner.lookup('service:store');
      const createRecordMock = sinon.mock();
      createRecordMock.returns({ save: function () {} });
      store.createRecord = createRecordMock;

      // when
      await clickByLabel(this.intl.t('pages.certification-joiner.form.actions.submit'));

      // then
      expect(contains('Le numéro de session est composé uniquement de chiffres.')).to.exist;
    });

    it('should display an error message on student mismatch error', async function () {
      // given
      this.set('onStepChange', sinon.stub());
      await render(hbs`<CertificationJoiner @onStepChange={{this.onStepChange}}/>`);
      await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.session-number'), '123456');
      await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.first-name'), 'Robert');
      await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.birth-name'), 'de Pix');
      await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.birth-day'), '02');
      await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.birth-month'), '01');
      await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.birth-year'), '2000');
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
      await clickByLabel(this.intl.t('pages.certification-joiner.form.actions.submit'));

      // then
      expect(
        contains(
          "Vous utilisez actuellement un compte qui n'est pas lié à votre établissement. Connectez vous au compte avec lequel vous avez effectué vos parcours ou demandez de l'aide au surveillant."
        )
      ).to.exist;
      expect(contains("Comment trouver le compte lié à l'établissement ?")).to.exist;
    });

    it('should display an error message on candidate not found', async function () {
      // given
      this.set('onStepChange', sinon.stub());
      await render(hbs`<CertificationJoiner @onStepChange={{this.onStepChange}}/>`);
      await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.session-number'), '123456');
      await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.first-name'), 'Robert');
      await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.birth-name'), 'de Pix');
      await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.birth-day'), '02');
      await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.birth-month'), '01');
      await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.birth-year'), '2000');
      const store = this.owner.lookup('service:store');
      const saveStub = sinon.stub();
      saveStub
        .withArgs({ adapterOptions: { joinSession: true, sessionId: '123456' } })
        .throws({ errors: [{ detail: 'blublabli' }] });
      const createRecordMock = sinon.mock();
      createRecordMock.returns({ save: saveStub, deleteRecord: function () {} });
      store.createRecord = createRecordMock;

      // when
      await clickByLabel(this.intl.t('pages.certification-joiner.form.actions.submit'));

      // then
      expect(contains(this.intl.t('pages.certification-joiner.error-messages.generic.disclaimer'))).to.exist;
      expect(contains(this.intl.t('pages.certification-joiner.error-messages.generic.check-session-number'))).to.exist;
      expect(contains(this.intl.t('pages.certification-joiner.error-messages.generic.check-personal-info'))).to.exist;
    });

    it('should display an error message on session not accessible', async function () {
      // given
      this.set('onStepChange', sinon.stub());
      await render(hbs`<CertificationJoiner @onStepChange={{this.onStepChange}}/>`);
      await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.session-number'), '123456');
      await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.first-name'), 'Robert');
      await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.birth-name'), 'de Pix');
      await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.birth-day'), '02');
      await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.birth-month'), '01');
      await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.birth-year'), '2000');
      const store = this.owner.lookup('service:store');
      const saveStub = sinon.stub();
      saveStub
        .withArgs({ adapterOptions: { joinSession: true, sessionId: '123456' } })
        .throws({ errors: [{ status: '412' }] });
      const createRecordMock = sinon.mock();
      createRecordMock.returns({ save: saveStub, deleteRecord: function () {} });
      store.createRecord = createRecordMock;

      // when
      await clickByLabel(this.intl.t('pages.certification-joiner.form.actions.submit'));

      // then
      expect(contains("La session que vous tentez de rejoindre n'est plus accessible.")).to.exist;
    });

    context('when candidate has already been linked to another user in the session', function () {
      it('should display an error message', async function () {
        // given
        this.set('onStepChange', sinon.stub());
        await render(hbs`<CertificationJoiner @onStepChange={{this.onStepChange}}/>`);
        await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.session-number'), '123456');
        await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.first-name'), 'Robert');
        await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.birth-name'), 'de Pix');
        await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.birth-day'), '02');
        await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.birth-month'), '01');
        await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.birth-year'), '2000');
        const store = this.owner.lookup('service:store');
        const saveStub = sinon.stub();
        saveStub
          .withArgs({ adapterOptions: { joinSession: true, sessionId: '123456' } })
          .throws({ errors: [{ status: '404' }] });
        const createRecordMock = sinon.mock();
        createRecordMock.returns({ save: saveStub, deleteRecord: function () {} });
        store.createRecord = createRecordMock;

        // when
        await clickByLabel(this.intl.t('pages.certification-joiner.form.actions.submit'));

        // then
        expect(contains(this.intl.t('pages.certification-joiner.error-messages.generic.disclaimer'))).to.exist;
        expect(
          contains(this.intl.t('pages.certification-joiner.error-messages.generic.check-session-number'))
        ).to.exist;
        expect(contains(this.intl.t('pages.certification-joiner.error-messages.generic.check-personal-info'))).to.exist;
      });
    });
  });
  context('when filling form', function () {
    context('should not allow filling letters in birth date', function () {
      it('day', async function () {
        // given
        this.set('onStepChange', sinon.stub());
        await render(hbs`<CertificationJoiner @onStepChange={{this.onStepChange}}/>`);

        // when
        await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.birth-day'), 'aa');

        // then
        const foo = find(`input[aria-label="${this.intl.t('pages.certification-joiner.form.fields.birth-day')}"]`);
        expect(foo.value).not.to.contains('aa');
      });

      it('month', async function () {
        // given
        this.set('onStepChange', sinon.stub());
        await render(hbs`<CertificationJoiner @onStepChange={{this.onStepChange}}/>`);

        // when
        await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.birth-month'), 'aa');

        // then
        const foo = find(`input[aria-label="${this.intl.t('pages.certification-joiner.form.fields.birth-month')}"]`);
        expect(foo.value).not.to.contains('aa');
      });

      it('year', async function () {
        // given
        this.set('onStepChange', sinon.stub());
        await render(hbs`<CertificationJoiner @onStepChange={{this.onStepChange}}/>`);

        // when
        await fillInByLabel(this.intl.t('pages.certification-joiner.form.fields.birth-year'), 'aa');

        // then
        const foo = find(`input[aria-label="${this.intl.t('pages.certification-joiner.form.fields.birth-year')}"]`);
        expect(foo.value).not.to.contains('aa');
      });
    });
  });
});
