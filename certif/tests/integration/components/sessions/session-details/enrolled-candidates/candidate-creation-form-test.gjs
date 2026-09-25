import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, fillIn } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import CandidateCreationForm from 'pix-certif/components/sessions/session-details/enrolled-candidates/candidate-creation-form';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module(
  'Integration | Component | Sessions | SessionDetails | EnrolledCandidates | candidate-creation-form',
  function (hooks) {
    setupIntlRenderingTest(hooks);

    hooks.beforeEach(async function () {
      const store = this.owner.lookup('service:store');

      class CurrentUserStub extends Service {
        currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
          type: 'SUP',
          habilitations: [
            { id: '0', label: 'Pix+ Droit', key: 'DROIT' },
            { id: '1', label: 'Pix+ Professionnels de Santé', key: 'PRO_SANTE' },
          ],
        });
      }

      this.owner.register('service:current-user', CurrentUserStub);
    });

    test('it shows candidate form', async function (assert) {
      // given
      const countries = [];

      // when
      const screen = await render(<template><CandidateCreationForm @countries={{countries}} /></template>);

      // then
      assert.dom(screen.getByRole('textbox', { name: 'Nom de naissance *' })).exists();
      assert.dom(screen.getByRole('textbox', { name: 'Prénom *' })).exists();
      assert.dom(screen.getByRole('radio', { name: 'Homme' })).exists();
      assert.dom(screen.getByRole('radio', { name: 'Femme' })).exists();
      assert.dom(screen.getByLabelText('Date de naissance *')).exists();
      assert.dom(screen.getByRole('button', { name: 'Pays de naissance *' })).exists();
      assert.dom(screen.getByRole('radio', { name: 'Code INSEE' })).exists();
      assert.dom(screen.getByRole('radio', { name: 'Code postal' })).exists();
      assert.dom(screen.getByRole('textbox', { name: 'Code INSEE de naissance *' })).exists();
      assert.dom(screen.getByRole('textbox', { name: 'Identifiant externe' })).exists();
      assert.dom(screen.getByRole('textbox', { name: 'Temps majoré (%)' })).exists();
      assert.dom(screen.getByRole('textbox', { name: /E-mail du prescripteur/ })).exists();
      assert
        .dom(screen.getByText(/Les candidats verront leurs résultats affichés directement sur leur compte Pix/))
        .exists();
      assert.dom(screen.getByRole('textbox', { name: /E-mail de convocation/ })).exists();
      assert.dom(screen.getByText(/L'envoi automatique de convocation par Pix n'est pas encore disponible/)).exists();
    });

    test('it should have some inputs required', async function (assert) {
      // given
      const countries = [];

      // when
      const screen = await render(<template><CandidateCreationForm @countries={{countries}} /></template>);

      // then
      assert.dom(screen.getByRole('textbox', { name: 'Nom de naissance *' })).hasAttribute('required');
      assert.dom(screen.getByRole('textbox', { name: 'Prénom *' })).hasAttribute('required');
      assert.dom(screen.getByLabelText('Date de naissance *')).hasAttribute('required');
      assert.dom(screen.getByRole('radio', { name: 'Femme' })).hasAttribute('required');
      assert.dom(screen.getByRole('textbox', { name: 'Code INSEE de naissance *' })).hasAttribute('required');
    });

    module('when the form is filled', function () {
      test('it should submit a student', async function (assert) {
        // given
        const candidateData = {
          firstName: 'Lara',
          lastName: 'Pafromage',
          birthdate: '1985-08-23',
          birthCity: '',
          birthCountry: 'France',
          birthInseeCode: '59386',
          birthPostalCode: '',
          email: 'lara.pafromage@example.com',
          resultRecipientEmail: 'eddy.thaurial@example.com',
          externalId: '11AA2233',
          extraTimePercentage: '20',
          sex: 'F',
          subscription: 'CORE',
          billingMode: '',
          prepaymentCode: '',
        };

        const saveCandidateStub = sinon.stub();

        const countries = [
          { id: 1, code: '99123', name: 'Syldavie' },
          { id: 2, code: '99100', name: 'France' },
          { id: 3, code: '99345', name: 'Botswana' },
        ];

        const screen = await render(
          <template><CandidateCreationForm @countries={{countries}} @saveCandidate={{saveCandidateStub}} /></template>,
        );

        await fillIn(screen.getByLabelText('Prénom *'), candidateData.firstName);
        await fillIn(screen.getByLabelText('Nom de naissance *'), candidateData.lastName);
        await click(screen.getByRole('radio', { name: 'Femme' }));
        await fillIn(screen.getByLabelText('Date de naissance *'), '1985-08-23');
        await click(screen.getByLabelText('Pays de naissance *'));
        await click(
          await screen.findByRole('option', {
            name: 'France',
          }),
        );
        await click(screen.getByRole('radio', { name: 'Code INSEE' }));
        await fillIn(screen.getByLabelText('Identifiant externe'), candidateData.externalId);
        await fillIn(screen.getByLabelText('Code INSEE de naissance *'), candidateData.birthInseeCode);
        await fillIn(screen.getByLabelText('Temps majoré (%)'), candidateData.extraTimePercentage);
        await fillIn(screen.getByLabelText(/E-mail du prescripteur/), candidateData.resultRecipientEmail);
        await fillIn(screen.getByLabelText(/E-mail de convocation/), candidateData.email);
        await click(screen.getByRole('radio', { name: 'Certification Pix' }));

        // when
        await click(screen.getByRole('button', { name: 'Inscrire le candidat' }));

        // then
        sinon.assert.calledOnce(saveCandidateStub);
        assert.deepEqual(saveCandidateStub.firstCall.args[0], candidateData);
      });
    });

    module('when the certification center is not SCO', function () {
      test('it shows candidate form with billing information', async function (assert) {
        // given
        const countries = [];

        // when
        const screen = await render(<template><CandidateCreationForm @countries={{countries}} /></template>);

        // then
        assert.dom(screen.getByRole('button', { name: 'Tarification part Pix *' })).isVisible();
      });

      module('when the selected billing mode is PREPAID', function () {
        test('it should display prepaid code field', async function (assert) {
          // given
          const countries = [];

          // when
          const screen = await render(<template><CandidateCreationForm @countries={{countries}} /></template>);

          await click(screen.getByRole('button', { name: `${t('common.forms.certification-labels.pricing')} *` }));
          await screen.findByRole('listbox');
          await click(screen.getByRole('option', { name: t('common.labels.billing-mode.prepaid') }));

          // then
          assert
            .dom(screen.getByRole('textbox', { name: t('common.forms.certification-labels.prepayment-code') }))
            .isVisible();
          assert
            .dom(screen.getByLabelText(t('pages.sessions.detail.candidates.add-form.prepayment-information')))
            .isVisible();
        });
      });

      module('when the selected billing mode is NOT PREPAID', function () {
        test('it should NOT display prepaid code field', async function (assert) {
          // given
          const countries = [];

          // when
          const screen = await render(<template><CandidateCreationForm @countries={{countries}} /></template>);

          await click(screen.getByRole('button', { name: `${t('common.forms.certification-labels.pricing')} *` }));
          await screen.findByRole('listbox');
          await click(screen.getByRole('option', { name: t('common.labels.billing-mode.paid') }));

          // then
          assert
            .dom(screen.queryByRole('textbox', { name: t('common.forms.certification-labels.prepayment-code') }))
            .doesNotExist();
          assert
            .dom(screen.queryByLabelText(t('pages.sessions.detail.candidates.add-form.prepayment-information')))
            .doesNotExist();
        });
      });
    });

    module('when the certification center is SCO', function (hooks) {
      hooks.beforeEach(function () {
        this.owner.lookup('service:current-user').currentAllowedCertificationCenterAccess.type = 'SCO';
      });

      test('it does not show billing information', async function (assert) {
        // given
        const countries = [];

        // when
        const screen = await render(<template><CandidateCreationForm @countries={{countries}} /></template>);

        // then
        assert
          .dom(screen.queryByRole('button', { name: `${t('common.forms.certification-labels.pricing')} *` }))
          .doesNotExist();
        assert
          .dom(screen.queryByRole('textbox', { name: t('common.forms.certification-labels.prepayment-code') }))
          .doesNotExist();
      });

      test('it should submit a candidate without any billing information', async function (assert) {
        // given
        const candidateData = {
          firstName: 'Lara',
          lastName: 'Pafromage',
          birthdate: '1985-08-23',
          birthCity: '',
          birthCountry: 'France',
          birthInseeCode: '59386',
          birthPostalCode: '',
          email: '',
          resultRecipientEmail: '',
          externalId: '',
          extraTimePercentage: '',
          sex: 'F',
          subscription: 'CORE',
        };

        const saveCandidateStub = sinon.stub();

        const countries = [{ id: 1, code: '99100', name: 'France' }];

        const screen = await render(
          <template><CandidateCreationForm @countries={{countries}} @saveCandidate={{saveCandidateStub}} /></template>,
        );

        await fillIn(screen.getByLabelText('Prénom *'), candidateData.firstName);
        await fillIn(screen.getByLabelText('Nom de naissance *'), candidateData.lastName);
        await click(screen.getByRole('radio', { name: 'Femme' }));
        await fillIn(screen.getByLabelText('Date de naissance *'), candidateData.birthdate);
        await click(screen.getByLabelText('Pays de naissance *'));
        await click(
          await screen.findByRole('option', {
            name: 'France',
          }),
        );
        await click(screen.getByRole('radio', { name: 'Code INSEE' }));
        await fillIn(screen.getByLabelText('Code INSEE de naissance *'), candidateData.birthInseeCode);
        await click(screen.getByRole('radio', { name: 'Certification Pix' }));

        // when
        await click(screen.getByRole('button', { name: 'Inscrire le candidat' }));

        // then
        sinon.assert.calledOnce(saveCandidateStub);
        assert.deepEqual(saveCandidateStub.firstCall.args[0], candidateData);
      });
    });

    test('it shows a countries list with France selected as default', async function (assert) {
      // given
      const countries = [
        { id: '1', code: '99123', name: 'Syldavie' },
        { id: '2', code: '99100', name: 'France' },
        { id: '3', code: '99345', name: 'Botswana' },
      ];

      // when
      const screen = await render(<template><CandidateCreationForm @countries={{countries}} /></template>);

      // then
      assert.dom(screen.getByRole('button', { name: 'Pays de naissance *' })).includesText('France');
    });

    test('it shows a link to return to the candidates list', async function (assert) {
      // given
      const countries = [];

      // when
      const screen = await render(
        <template><CandidateCreationForm @sessionId='123' @countries={{countries}} /></template>,
      );

      // then
      assert
        .dom(screen.getByRole('link', { name: t('common.actions.back') }))
        .hasAttribute('href', '/sessions/123/candidats');
    });

    module('when a foreign country is selected', function () {
      test('it shows city field and hides insee code and postal code fields', async function (assert) {
        // given
        const countries = [{ code: '99123', name: 'Borduristan' }];

        // when
        const screen = await render(<template><CandidateCreationForm @countries={{countries}} /></template>);

        await click(screen.getByRole('button', { name: 'Pays de naissance *' }));

        await screen.findByRole('listbox');

        await click(
          await screen.findByRole('option', {
            name: 'Borduristan',
          }),
        );

        // then
        assert.dom(screen.queryByLabelText('Code INSEE de naissance *')).isNotVisible();
        assert.dom(screen.queryByLabelText('Code postal de naissance *')).isNotVisible();
        assert.dom(screen.getByLabelText('Commune de naissance *')).isVisible();
      });
    });

    module('when the insee code option is selected', function () {
      test('it shows insee code field and hides postal code and city fields', async function (assert) {
        // given
        const countries = [{ code: '99123', name: 'Borduristan' }];

        // when
        const screen = await render(<template><CandidateCreationForm @countries={{countries}} /></template>);

        await click(screen.getByRole('radio', { name: 'Code INSEE' }));

        // then
        assert.dom(screen.getByLabelText('Code INSEE de naissance *')).isVisible();
        assert.dom(screen.queryByLabelText('Code postal de naissance *')).isNotVisible();
        assert.dom(screen.queryByLabelText('Commune de naissance *')).isNotVisible();
      });
    });

    module('when the postal code option is selected', function () {
      test('it shows postal code and city fields and hides insee code field', async function (assert) {
        // given
        const countries = [{ code: '99123', name: 'Borduristan' }];

        // when
        const screen = await render(<template><CandidateCreationForm @countries={{countries}} /></template>);

        await click(screen.getByRole('radio', { name: 'Code postal' }));

        // then
        assert.dom(screen.queryByLabelText('Code INSEE de naissance *')).isNotVisible();
        assert.dom(screen.queryByLabelText('Code postal de naissance *')).isVisible();
        assert.dom(screen.getByLabelText('Commune de naissance *')).isVisible();
      });
    });

    module('when center is allowed access to complementary certifications', function () {
      test('it display complementary certification options', async function (assert) {
        // given
        const countries = [{ code: '99123', name: 'Borduristan' }];

        // when
        const screen = await render(<template><CandidateCreationForm @countries={{countries}} /></template>);

        // then
        assert.dom(screen.getByRole('group', { name: 'Choix de la certification *' })).exists();
        assert.dom(screen.getByRole('radio', { name: 'Pix+ Droit' })).exists();
        assert.dom(screen.getByRole('radio', { name: 'Pix+ Professionnels de Santé' })).exists();
      });
    });
  },
);
