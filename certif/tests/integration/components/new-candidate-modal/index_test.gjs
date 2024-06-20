import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, fillIn } from '@ember/test-helpers';
import NewCandidateModal from 'pix-certif/components/new-candidate-modal';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | new-candidate-modal', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(async function () {
    const store = this.owner.lookup('service:store');

    class CurrentUserStub extends Service {
      currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
        habilitations: [
          { id: 0, label: 'Certif complémentaire 1', key: 'COMP_1', hasComplementaryReferential: false },
          { id: 1, label: 'Certif complémentaire 2', key: 'COMP_2', hasComplementaryReferential: true },
        ],
        isComplementaryAlonePilot: false,
      });
    }

    this.owner.register('service:current-user', CurrentUserStub);
  });

  test('it shows candidate form', async function (assert) {
    // given
    const closeModalStub = sinon.stub();
    const updateCandidateStub = sinon.stub();
    const updateCandidateWithEventStub = sinon.stub();
    const countries = [];
    const candidateData = {
      firstName: '',
      lastName: '',
      birthdate: '',
      birthCity: '',
      birthCountry: '',
      email: '',
      externalId: '',
      resultRecipientEmail: '',
      birthPostalCode: '',
      birthInseeCode: '',
      sex: '',
      extraTimePercentage: '',
    };

    // when
    const screen = await render(
      <template>
        <NewCandidateModal
          @showModal={{true}}
          @closeModal={{closeModalStub}}
          @countries={{countries}}
          @updateCandidateData={{updateCandidateStub}}
          @updateCandidateDataWithEvent={{updateCandidateWithEventStub}}
          @candidateData={{candidateData}}
        />
      </template>,
    );

    // then
    assert.dom(screen.getByRole('textbox', { name: '* Nom de naissance' })).exists();
    assert.dom(screen.getByRole('textbox', { name: '* Prénom' })).exists();
    assert.dom(screen.getByRole('radio', { name: 'Homme' })).exists();
    assert.dom(screen.getByRole('radio', { name: 'Femme' })).exists();
    assert.dom(screen.getByRole('textbox', { name: '* Date de naissance' })).exists();
    assert.dom(screen.getByRole('button', { name: '* Pays de naissance' })).exists();
    assert.dom(screen.getByRole('radio', { name: 'Code INSEE' })).exists();
    assert.dom(screen.getByRole('radio', { name: 'Code postal' })).exists();
    assert.dom(screen.getByRole('textbox', { name: '* Code INSEE de naissance' })).exists();
    assert.dom(screen.getByRole('textbox', { name: 'Identifiant externe' })).exists();
    assert.dom(screen.getByRole('textbox', { name: 'Temps majoré (%)' })).exists();
    assert
      .dom(screen.getByRole('textbox', { name: 'E-mail du destinataire des résultats (formateur, enseignant...)' }))
      .exists();
    assert
      .dom(
        screen.getByText(
          'Si le champ n’est pas renseigné, les résultats ne seront pas transmis par mail pour le/les candidats concernés.Le candidat verra ses résultats affichés directement sur son compte Pix.',
        ),
      )
      .exists();
    assert.dom(screen.getByRole('textbox', { name: 'E-mail de convocation' })).exists();
  });

  test('it should have some inputs required', async function (assert) {
    // given
    const closeModalStub = sinon.stub();
    const updateCandidateStub = sinon.stub();
    const updateCandidateWithEventStub = sinon.stub();
    const countries = [];

    // when
    const screen = await render(
      <template>
        <NewCandidateModal
          @showModal={{true}}
          @closeModal={{closeModalStub}}
          @countries={{countries}}
          @updateCandidateData={{updateCandidateStub}}
          @updateCandidateDataWithEvent={{updateCandidateWithEventStub}}
        />
      </template>,
    );

    // then
    assert.dom(screen.getByRole('textbox', { name: '* Nom de naissance' })).hasAttribute('required');
    assert.dom(screen.getByRole('textbox', { name: '* Prénom' })).hasAttribute('required');
    assert.dom(screen.getByRole('textbox', { name: '* Date de naissance' })).hasAttribute('required');
    assert.dom(screen.getByRole('radio', { name: 'Femme' })).hasAttribute('required');
    assert.dom(screen.getByRole('textbox', { name: '* Code INSEE de naissance' })).hasAttribute('required');
  });

  module('when the form is filled', () => {
    test('it should submit a student', async function (assert) {
      const closeModalStub = sinon.stub();
      const updateCandidateFromValueStub = sinon.stub();
      updateCandidateFromValueStub.callsFake((object, key, value) => (object[key] = value));

      const updateCandidateFromEventStub = sinon.stub();
      updateCandidateFromEventStub.callsFake((object, field, event) => (object[field] = event.target.value));

      const saveCandidateStub = sinon.stub();

      const countries = [
        { id: 1, code: '99123', name: 'Syldavie' },
        { id: 2, code: '99100', name: 'France' },
        { id: 3, code: '99345', name: 'Botswana' },
      ];
      const candidateData = {
        firstName: '',
        lastName: '',
        birthdate: '',
        birthCity: '',
        birthCountry: '',
        email: '',
        externalId: '',
        resultRecipientEmail: '',
        birthPostalCode: '',
        birthInseeCode: '',
        sex: '',
        extraTimePercentage: '',
      };

      // when
      const screen = await render(
        <template>
          <NewCandidateModal
            @showModal={{true}}
            @closeModal={{closeModalStub}}
            @countries={{countries}}
            @updateCandidateData={{updateCandidateFromEventStub}}
            @updateCandidateDataFromValue={{updateCandidateFromValueStub}}
            @candidateData={{candidateData}}
            @saveCandidate={{saveCandidateStub}}
          />
        </template>,
      );

      await fillIn(screen.getByLabelText('* Prénom'), 'Guybrush');
      await fillIn(screen.getByLabelText('* Nom de naissance'), 'Threepwood');
      await fillIn(screen.getByLabelText('* Date de naissance'), '28/04/2019');
      await click(screen.getByRole('radio', { name: 'Homme' }));
      await click(screen.getByLabelText('* Pays de naissance'));
      await click(
        await screen.findByRole('option', {
          name: 'France',
        }),
      );
      await click(screen.getByRole('radio', { name: 'Code INSEE' }));
      await fillIn(screen.getByLabelText('Identifiant externe'), '44AA3355');
      await fillIn(screen.getByLabelText('* Code INSEE de naissance'), '75100');
      await fillIn(screen.getByLabelText('Temps majoré (%)'), '20');
      await fillIn(
        screen.getByLabelText('E-mail du destinataire des résultats (formateur, enseignant...)'),
        'email.destinataire@example.net',
      );
      await fillIn(screen.getByLabelText('E-mail de convocation'), 'email.convocation@example.net');

      await click(screen.getByRole('button', { name: 'Inscrire le candidat' }));

      // then
      sinon.assert.calledOnceWithExactly(saveCandidateStub, {
        firstName: 'Guybrush',
        lastName: 'Threepwood',
        birthdate: '2019-04-28',
        birthCity: '',
        birthCountry: 'France',
        email: 'email.convocation@example.net',
        externalId: '44AA3355',
        resultRecipientEmail: 'email.destinataire@example.net',
        birthPostalCode: '',
        birthInseeCode: '75100',
        sex: 'M',
        extraTimePercentage: '20',
      });
      assert.ok(true);
    });
  });

  module('when shouldDisplayPaymentOptions is true', function () {
    test('it shows candidate form with billing information', async function (assert) {
      // given
      const shouldDisplayPaymentOptions = true;
      const closeModalStub = sinon.stub();
      const updateCandidateStub = sinon.stub();
      const updateCandidateFromValueStub = sinon.stub();
      const updateCandidateWithEventStub = sinon.stub();
      const countries = [];
      const candidateData = {
        firstName: '',
        lastName: '',
        birthdate: '',
        birthCity: '',
        birthCountry: '',
        email: '',
        externalId: '',
        resultRecipientEmail: '',
        birthPostalCode: '',
        birthInseeCode: '',
        sex: '',
        extraTimePercentage: '',
      };

      // when
      const screen = await render(
        <template>
          <NewCandidateModal
            @showModal={{true}}
            @closeModal={{closeModalStub}}
            @countries={{countries}}
            @updateCandidateData={{updateCandidateStub}}
            @updateCandidateDataWithEvent={{updateCandidateWithEventStub}}
            @candidateData={{candidateData}}
            @shouldDisplayPaymentOptions={{shouldDisplayPaymentOptions}}
            @updateCandidateDataFromValue={{updateCandidateFromValueStub}}
          />
        </template>,
      );

      // then
      assert.dom(screen.getByRole('button', { name: '* Tarification part Pix' })).exists();
      assert.dom(screen.getByRole('textbox', { name: 'Code de prépaiement' })).exists();
      assert.dom(screen.getByLabelText('Information du code de prépaiement')).exists();
    });
  });

  test('it shows a countries list with France selected as default', async function (assert) {
    // given
    const closeModalStub = sinon.stub();
    const updateCandidateStub = sinon.stub();
    const updateCandidateWithEventStub = sinon.stub();
    const countries = [
      { id: 1, code: '99123', name: 'Syldavie' },
      { id: 2, code: '99100', name: 'France' },
      { id: 3, code: '99345', name: 'Botswana' },
    ];
    const candidateData = {
      firstName: '',
      lastName: '',
      birthdate: '',
      birthCity: '',
      birthCountry: '',
      email: '',
      externalId: '',
      resultRecipientEmail: '',
      birthPostalCode: '',
      birthInseeCode: '',
      sex: '',
      extraTimePercentage: '',
    };

    // when
    const screen = await render(
      <template>
        <NewCandidateModal
          @showModal={{true}}
          @closeModal={{closeModalStub}}
          @countries={{countries}}
          @updateCandidateData={{updateCandidateStub}}
          @updateCandidateDataWithEvent={{updateCandidateWithEventStub}}
          @candidateData={{candidateData}}
        />
      </template>,
    );

    // then
    assert.dom(screen.getByRole('button', { name: '* Pays de naissance' })).includesText('France');
  });

  module('when close button cross icon is clicked', () => {
    test('it closes candidate details modal', async function (assert) {
      // given
      const closeModalStub = sinon.stub();
      const updateCandidateStub = sinon.stub();
      const updateCandidateWithEventStub = sinon.stub();
      const countries = [];
      const candidateData = {
        firstName: '',
        lastName: '',
        birthdate: '',
        birthCity: '',
        birthCountry: '',
        email: '',
        externalId: '',
        resultRecipientEmail: '',
        birthPostalCode: '',
        birthInseeCode: '',
        sex: '',
        extraTimePercentage: '',
      };

      // when
      const screen = await render(
        <template>
          <NewCandidateModal
            @showModal={{true}}
            @closeModal={{closeModalStub}}
            @countries={{countries}}
            @updateCandidateData={{updateCandidateStub}}
            @updateCandidateDataWithEvent={{updateCandidateWithEventStub}}
            @candidateData={{candidateData}}
          />
        </template>,
      );

      await click(screen.getByRole('button', { name: 'Fermer' }));

      // then
      sinon.assert.calledOnce(closeModalStub);
      assert.ok(true);
    });
  });

  module('when close bottom button is clicked', () => {
    test('it closes candidate details modal ', async function (assert) {
      // given
      const closeModalStub = sinon.stub();
      const updateCandidateStub = sinon.stub();
      const updateCandidateWithEventStub = sinon.stub();
      const countries = [];
      const candidateData = {
        firstName: '',
        lastName: '',
        birthdate: '',
        birthCity: '',
        birthCountry: '',
        email: '',
        externalId: '',
        resultRecipientEmail: '',
        birthPostalCode: '',
        birthInseeCode: '',
        sex: '',
        extraTimePercentage: '',
      };

      // when
      const screen = await render(
        <template>
          <NewCandidateModal
            @showModal={{true}}
            @closeModal={{closeModalStub}}
            @countries={{countries}}
            @updateCandidateData={{updateCandidateStub}}
            @updateCandidateDataWithEvent={{updateCandidateWithEventStub}}
            @candidateData={{candidateData}}
          />
        </template>,
      );

      await click(screen.getByRole('button', { name: 'Fermer' }));

      // then
      sinon.assert.calledOnce(closeModalStub);
      assert.ok(true);
    });
  });

  module('when a foreign country is selected', () => {
    test('it shows city field and hides insee code and postal code fields', async function (assert) {
      // given
      const closeModalStub = sinon.stub();
      const updateCandidateWithEventStub = sinon.stub();
      const updateCandidateDataFromValue = sinon.stub();
      const countries = [{ code: '99123', name: 'Borduristan' }];
      const candidateData = {
        firstName: '',
        lastName: '',
        birthdate: '',
        birthCity: '',
        birthCountry: '',
        email: '',
        externalId: '',
        resultRecipientEmail: '',
        birthPostalCode: '',
        birthInseeCode: '',
        sex: '',
        extraTimePercentage: '',
      };

      // when
      const screen = await render(
        <template>
          <NewCandidateModal
            @showModal={{true}}
            @closeModal={{closeModalStub}}
            @countries={{countries}}
            @updateCandidateData={{updateCandidateWithEventStub}}
            @updateCandidateDataFromValue={{updateCandidateDataFromValue}}
            @candidateData={{candidateData}}
          />
        </template>,
      );

      await click(screen.getByRole('button', { name: '* Pays de naissance' }));
      await click(
        await screen.findByRole('option', {
          name: 'Borduristan',
        }),
      );

      // then
      assert.dom(screen.queryByLabelText('* Code INSEE de naissance')).isNotVisible();
      assert.dom(screen.queryByLabelText('* Code postal de naissance')).isNotVisible();
      assert.dom(screen.getByLabelText('* Commune de naissance')).isVisible();
    });
  });

  module('when the insee code option is selected', () => {
    test('it shows insee code field and hides postal code and city fields', async function (assert) {
      // given
      const closeModalStub = sinon.stub();
      const updateCandidateFromValueStub = sinon.stub();
      const updateCandidateFromEventStub = sinon.stub();
      const countries = [{ code: '99123', name: 'Borduristan' }];
      const candidateData = {
        firstName: '',
        lastName: '',
        birthdate: '',
        birthCity: '',
        birthCountry: '',
        email: '',
        externalId: '',
        resultRecipientEmail: '',
        birthPostalCode: '',
        birthInseeCode: '',
        sex: '',
        extraTimePercentage: '',
      };

      // when
      const screen = await render(
        <template>
          <NewCandidateModal
            @showModal={{true}}
            @closeModal={{closeModalStub}}
            @countries={{countries}}
            @updateCandidateData={{updateCandidateFromEventStub}}
            @updateCandidateDataFromValue={{updateCandidateFromValueStub}}
            @candidateData={{candidateData}}
          />
        </template>,
      );

      await click(screen.getByRole('radio', { name: 'Code INSEE' }));

      // then
      assert.dom(screen.getByLabelText('* Code INSEE de naissance')).isVisible();
      assert.dom(screen.queryByLabelText('* Code postal de naissance')).isNotVisible();
      assert.dom(screen.queryByLabelText('* Commune de naissance')).isNotVisible();
    });
  });

  module('when the postal code option is selected', () => {
    test('it shows postal code and city fields and hides insee code field', async function (assert) {
      // given
      const closeModalStub = sinon.stub();
      const updateCandidateFromValueStub = sinon.stub();
      const updateCandidateFromEventStub = sinon.stub();
      const countries = [{ code: '99123', name: 'Borduristan' }];
      const candidateData = {
        firstName: '',
        lastName: '',
        birthdate: '',
        birthCity: '',
        birthCountry: '',
        email: '',
        externalId: '',
        resultRecipientEmail: '',
        birthPostalCode: '',
        birthInseeCode: '',
        sex: '',
        extraTimePercentage: '',
      };

      // when
      const screen = await render(
        <template>
          <NewCandidateModal
            @showModal={{true}}
            @closeModal={{closeModalStub}}
            @countries={{countries}}
            @updateCandidateData={{updateCandidateFromEventStub}}
            @updateCandidateDataFromValue={{updateCandidateFromValueStub}}
            @candidateData={{candidateData}}
          />
        </template>,
      );

      await click(screen.getByRole('radio', { name: 'Code postal' }));

      // then
      assert.dom(screen.queryByLabelText('* Code INSEE de naissance')).isNotVisible();
      assert.dom(screen.queryByLabelText('* Code postal de naissance')).isVisible();
      assert.dom(screen.getByLabelText('* Commune de naissance')).isVisible();
    });
  });

  module('when center is allowed access to complementary certifications', () => {
    test('it display complementary certification options', async function (assert) {
      // given
      const updateCandidateFromEventStub = sinon.stub();
      const countries = [{ code: '99123', name: 'Borduristan' }];

      // when
      const screen = await render(
        <template>
          <NewCandidateModal
            @showModal={{true}}
            @countries={{countries}}
            @updateCandidateData={{updateCandidateFromEventStub}}
          />
        </template>,
      );

      // then
      assert.dom(screen.getByRole('group', { name: 'Certification complémentaire' })).exists();
      assert.dom(screen.getByRole('radio', { name: 'Certif complémentaire 1' })).exists();
      assert.dom(screen.getByRole('radio', { name: 'Certif complémentaire 2' })).exists();
    });

    module('when certification center is a complementary alone pilot', function () {
      module('when the selected complementary certification has a referential', function () {
        test('it display complementary alone options', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          class CurrentUserStub extends Service {
            currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
              habilitations: [
                { id: 0, label: 'Certif complémentaire 1', key: 'COMP_1', hasComplementaryReferential: false },
                { id: 1, label: 'Certif complémentaire 2', key: 'COMP_2', hasComplementaryReferential: true },
              ],
              isComplementaryAlonePilot: true,
            });
          }

          this.owner.register('service:current-user', CurrentUserStub);

          const updateCandidateFromEventStub = sinon.stub();
          const countries = [{ code: '99123', name: 'Borduristan' }];
          const candidateData = {
            firstName: '',
            lastName: '',
            birthdate: '',
            birthCity: '',
            birthCountry: '',
            email: '',
            externalId: '',
            resultRecipientEmail: '',
            birthPostalCode: '',
            birthInseeCode: '',
            sex: '',
            extraTimePercentage: '',
          };

          // when
          const screen = await render(
            <template>
              <NewCandidateModal
                @showModal={{true}}
                @countries={{countries}}
                @updateCandidateData={{updateCandidateFromEventStub}}
                @candidateData={{candidateData}}
              />
            </template>,
          );

          const complementaryWithReferential = screen.getByRole('radio', { name: 'Certif complémentaire 2' });

          await click(complementaryWithReferential);

          // then
          assert.dom(screen.getByRole('group', { name: 'Quelles épreuves le candidat passera-t-il ?' })).exists();
          assert.dom(screen.getByRole('radio', { name: 'Seulement la certification Pix+' })).exists();
          assert.dom(screen.getByRole('radio', { name: 'La certification Pix et Pix+' })).exists();
        });
      });

      module('when the selected complementary certification has no complementary referential', function () {
        test('it does not display complementary alone options', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          class CurrentUserStub extends Service {
            currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
              habilitations: [
                { id: 0, label: 'Certif complémentaire 1', key: 'COMP_1', hasComplementaryReferential: false },
                { id: 1, label: 'Certif complémentaire 2', key: 'COMP_2', hasComplementaryReferential: true },
              ],
              isComplementaryAlonePilot: true,
            });
          }

          this.owner.register('service:current-user', CurrentUserStub);

          const updateCandidateFromEventStub = sinon.stub();
          const countries = [{ code: '99123', name: 'Borduristan' }];
          const candidateData = {
            firstName: '',
            lastName: '',
            birthdate: '',
            birthCity: '',
            birthCountry: '',
            email: '',
            externalId: '',
            resultRecipientEmail: '',
            birthPostalCode: '',
            birthInseeCode: '',
            sex: '',
            extraTimePercentage: '',
          };

          // when
          const screen = await render(
            <template>
              <NewCandidateModal
                @showModal={{true}}
                @countries={{countries}}
                @updateCandidateData={{updateCandidateFromEventStub}}
                @candidateData={{candidateData}}
              />
            </template>,
          );

          const complementaryWithoutReferential = screen.getByRole('radio', { name: 'Certif complémentaire 1' });
          await click(complementaryWithoutReferential);

          // then
          assert
            .dom(screen.queryByRole('group', { name: 'Quelles épreuves le candidat passera-t-il ?' }))
            .doesNotExist();
          assert.dom(screen.queryByRole('radio', { name: 'Seulement la certification Pix+' })).doesNotExist();
          assert.dom(screen.queryByRole('radio', { name: 'La certification Pix et Pix+' })).doesNotExist();
        });
      });

      module('when the selected option is not a certification (e.g. : "None")', function () {
        test('it does not display complementary alone options', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          class CurrentUserStub extends Service {
            currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
              habilitations: [
                { id: 0, label: 'Certif complémentaire 1', key: 'COMP_1', hasComplementaryReferential: false },
                { id: 1, label: 'Certif complémentaire 2', key: 'COMP_2', hasComplementaryReferential: true },
              ],
              isComplementaryAlonePilot: true,
            });
          }

          this.owner.register('service:current-user', CurrentUserStub);

          const updateCandidateFromEventStub = sinon.stub();
          const countries = [{ code: '99123', name: 'Borduristan' }];
          const candidateData = {
            firstName: '',
            lastName: '',
            birthdate: '',
            birthCity: '',
            birthCountry: '',
            email: '',
            externalId: '',
            resultRecipientEmail: '',
            birthPostalCode: '',
            birthInseeCode: '',
            sex: '',
            extraTimePercentage: '',
          };

          // when
          const screen = await render(
            <template>
              <NewCandidateModal
                @showModal={{true}}
                @countries={{countries}}
                @updateCandidateData={{updateCandidateFromEventStub}}
                @candidateData={{candidateData}}
              />
            </template>,
          );

          const noComplementaryCertificationOption = screen.getByRole('radio', { name: 'Aucune' });
          await click(noComplementaryCertificationOption);

          // then
          assert
            .dom(screen.queryByRole('group', { name: 'Quelles épreuves le candidat passera-t-il ?' }))
            .doesNotExist();
          assert.dom(screen.queryByRole('radio', { name: 'Seulement la certification Pix+' })).doesNotExist();
          assert.dom(screen.queryByRole('radio', { name: 'La certification Pix et Pix+' })).doesNotExist();
        });
      });
    });

    module('when certification center is not a complementary alone pilot', function () {
      test('it not display complementary alone options', async function (assert) {
        const updateCandidateFromEventStub = sinon.stub();
        const countries = [{ code: '99123', name: 'Borduristan' }];
        const candidateData = {
          firstName: '',
          lastName: '',
          birthdate: '',
          birthCity: '',
          birthCountry: '',
          email: '',
          externalId: '',
          resultRecipientEmail: '',
          birthPostalCode: '',
          birthInseeCode: '',
          sex: '',
          extraTimePercentage: '',
        };

        // when
        const screen = await render(
          <template>
            <NewCandidateModal
              @showModal={{true}}
              @countries={{countries}}
              @updateCandidateData={{updateCandidateFromEventStub}}
              @candidateData={{candidateData}}
            />
          </template>,
        );

        const complementaryWithReferential = screen.getByRole('radio', { name: 'Certif complémentaire 2' });
        await click(complementaryWithReferential);

        // then
        assert.dom(screen.queryByRole('group', { name: 'Quelles épreuves le candidat passera-t-il ?' })).doesNotExist();
        assert.dom(screen.queryByRole('radio', { name: 'Seulement la certification Pix+' })).doesNotExist();
        assert.dom(screen.queryByRole('radio', { name: 'La certification Pix et Pix+' })).doesNotExist();
      });
    });
  });
});
