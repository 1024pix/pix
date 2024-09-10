import { render as renderScreen } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { COMPLEMENTARY_KEYS, SUBSCRIPTION_TYPES } from 'pix-certif/models/subscription';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Sessions | SessionDetails | EnrolledCandidates', function (hooks) {
  setupIntlRenderingTest(hooks);

  const DELETE_BUTTON_SELECTOR = 'certification-candidates-actions__delete-button';
  const EDIT_BUTTON_SELECTOR = 'certification-candidates-actions__edit-button';
  const DELETE_BUTTON_DISABLED_SELECTOR = `${DELETE_BUTTON_SELECTOR}--disabled`;
  const EDIT_BUTTON_DISABLED_SELECTOR = `${EDIT_BUTTON_SELECTOR}--disabled`;

  let store;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
    const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
      id: '123',
      name: 'Center',
      type: 'PRO',
      habilitations: [
        { id: '0', label: 'Certif complémentaire 1', key: 'COMP_1' },
        { id: '1', label: 'Certif complémentaire 2', key: 'COMP_2' },
      ],
      isComplementaryAlonePilot: false,
      isV3Pilot: false,
    });

    class CurrentUserStub extends Service {
      currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
    }
    class FeatureTogglesStub extends Service {
      featureToggles = store.createRecord('feature-toggle', {
        isNeedToAdjustCertificationAccessibilityEnabled: false,
      });
    }

    this.owner.register('service:current-user', CurrentUserStub);
    this.owner.register('service:feature-toggles', FeatureTogglesStub);
  });

  test('it should have an accessible table description', async function (assert) {
    //given
    const candidate = _buildCertificationCandidate({
      birthdate: new Date('2019-04-28'),
      subscriptions: [],
    });

    const certificationCandidate = store.createRecord('certification-candidate', candidate);
    const countries = store.createRecord('country', { name: 'CANADA', code: 99401 });

    this.set('certificationCandidates', [certificationCandidate]);
    this.set('countries', [countries]);

    // when
    const screen = await renderScreen(hbs`<EnrolledCandidates
  @sessionId='1'
  @certificationCandidates={{this.certificationCandidates}}
  @countries={{this.countries}}
/>`);

    // then
    assert
      .dom(
        screen.getByRole('table', {
          name: t('pages.sessions.detail.candidates.list.with-details-description'),
        }),
      )
      .exists();
  });

  test('it displays candidate information', async function (assert) {
    // given
    const complementaryCertificationId = 2;
    const coreSubscription = store.createRecord('subscription', {
      type: SUBSCRIPTION_TYPES.CORE,
      complementaryCertificationId: null,
    });
    const complementarySubscription = store.createRecord('subscription', {
      type: SUBSCRIPTION_TYPES.COMPLEMENTARY,
      complementaryCertificationId,
    });
    const candidate = _buildCertificationCandidate({
      birthdate: new Date('2019-04-28'),
      accessibilityAdjustmentNeeded: true,
      subscriptions: [coreSubscription, complementarySubscription],
    });
    const complementaryCertification = {
      id: complementaryCertificationId,
      label: 'Pix+Droit',
    };

    const countries = store.createRecord('country', { name: 'CANADA', code: 99401 });
    const certificationCandidate = store.createRecord('certification-candidate', candidate);

    this.set('certificationCandidates', [certificationCandidate]);
    this.set('complementaryCertifications', [complementaryCertification]);
    this.set('countries', [countries]);

    // when
    const screen = await renderScreen(
      hbs`<EnrolledCandidates
  @sessionId='1'
  @certificationCandidates={{this.certificationCandidates}}
  @countries={{this.countries}}
  @complementaryCertifications={{this.complementaryCertifications}}
/>`,
    );

    // then
    assert.dom(screen.queryByRole('columnheader', { name: 'Accessibilité' })).doesNotExist();
    assert.dom(screen.getByRole('cell', { name: certificationCandidate.externalId })).exists();
    assert.dom(screen.getByRole('cell', { name: certificationCandidate.lastName })).exists();
    assert.dom(screen.getByRole('cell', { name: certificationCandidate.firstName })).exists();
    assert.dom(screen.getByRole('cell', { name: certificationCandidate.resultRecipientEmail })).exists();
    assert.dom(screen.getByRole('cell', { name: '30 %' })).exists();
    assert.dom(screen.getByRole('cell', { name: 'Certification Pix, Pix+Droit' })).exists();
    assert.dom(screen.queryByRole('cell', { name: certificationCandidate.birthCity })).doesNotExist();
    assert.dom(screen.queryByRole('cell', { name: certificationCandidate.birthProvinceCode })).doesNotExist();
    assert.dom(screen.queryByRole('cell', { name: certificationCandidate.birthCountry })).doesNotExist();
    assert.dom(screen.queryByRole('cell', { name: certificationCandidate.email })).doesNotExist();
  });

  module('when center is v3 pilot', function (hooks) {
    hooks.beforeEach(async function () {
      store = this.owner.lookup('service:store');
      const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
        id: '456',
        name: 'Center',
        type: 'PRO',
        isV3Pilot: true,
      });

      class CurrentUserStub extends Service {
        currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
      }

      this.owner.register('service:current-user', CurrentUserStub);
    });

    module('when feature toggle isNeedToAdjustCertificationAccessibilityEnabled is true', function (hooks) {
      hooks.beforeEach(async function () {
        class FeatureTogglesStub extends Service {
          featureToggles = store.createRecord('feature-toggle', {
            isNeedToAdjustCertificationAccessibilityEnabled: true,
          });
        }

        this.owner.register('service:feature-toggles', FeatureTogglesStub);
      });

      test('it display candidates with an edit button', async function (assert) {
        // given
        const certificationCandidates = [
          _buildCertificationCandidate({
            id: 1,
            firstName: 'Riri',
            lastName: 'Duck',
            isLinked: false,
            subscriptions: [],
          }),
          _buildCertificationCandidate({
            id: 2,
            firstName: 'Fifi',
            lastName: 'Duck',
            isLinked: true,
            subscriptions: [],
          }),
          _buildCertificationCandidate({
            id: 3,
            firstName: 'Loulou',
            lastName: 'Duck',
            isLinked: false,
            subscriptions: [],
          }),
        ].map((candidateData) => store.createRecord('certification-candidate', candidateData));
        const countries = store.createRecord('country', { name: 'CANADA', code: 99401 });

        this.set('countries', [countries]);
        this.set('certificationCandidates', certificationCandidates);

        // when
        const screen = await renderScreen(hbs`<EnrolledCandidates
  @sessionId='1'
  @certificationCandidates={{this.certificationCandidates}}
  @countries={{this.countries}}
/>`);

        // then

        // then
        assert.dom(screen.getByRole('button', { name: 'Editer le candidat Riri Duck' })).hasClass(EDIT_BUTTON_SELECTOR);
        assert
          .dom(screen.getByRole('button', { name: 'Editer le candidat Fifi Duck' }))
          .hasClass(EDIT_BUTTON_DISABLED_SELECTOR);
        assert
          .dom(screen.getByRole('button', { name: 'Editer le candidat Loulou Duck' }))
          .hasClass(EDIT_BUTTON_SELECTOR);
        assert.strictEqual(
          screen.getAllByText("Ce candidat a déjà rejoint la session. Vous ne pouvez pas l'éditer.").length,
          1,
        );
      });

      module('when candidate needs accessibility adjusted certification', function () {
        test('should display candidate needs accessibility adjusted certification', async function (assert) {
          // given
          const candidate = _buildCertificationCandidate({
            birthdate: new Date('2019-04-28'),
            accessibilityAdjustmentNeeded: true,
          });

          const countries = store.createRecord('country', { name: 'CANADA', code: 99401 });
          const certificationCandidate = store.createRecord('certification-candidate', candidate);

          this.set('certificationCandidates', [certificationCandidate]);
          this.set('countries', [countries]);

          // when
          const screen = await renderScreen(
            hbs`<EnrolledCandidates
  @sessionId='1'
  @certificationCandidates={{this.certificationCandidates}}
  @displayComplementaryCertification={{this.displayComplementaryCertification}}
  @countries={{this.countries}}
  @complementaryCertifications={{this.complementaryCertifications}}
/>`,
          );

          // then
          assert.dom(screen.getByRole('columnheader', { name: 'Accessibilité' })).exists();
          assert.dom(screen.getByRole('cell', { name: 'Oui' })).exists();
        });
      });

      module('when candidate doesnt need accessibility adjusted certification', function () {
        test('should display candidate doesnt need accessibility adjusted certification', async function (assert) {
          // given
          const candidate = _buildCertificationCandidate({
            birthdate: new Date('2019-04-28'),
            accessibilityAdjustmentNeeded: false,
          });

          const countries = store.createRecord('country', { name: 'CANADA', code: 99401 });
          const certificationCandidate = store.createRecord('certification-candidate', candidate);

          this.set('certificationCandidates', [certificationCandidate]);
          this.set('countries', [countries]);

          // when
          const screen = await renderScreen(
            hbs`<EnrolledCandidates
  @sessionId='1'
  @certificationCandidates={{this.certificationCandidates}}
  @displayComplementaryCertification={{this.displayComplementaryCertification}}
  @countries={{this.countries}}
  @complementaryCertifications={{this.complementaryCertifications}}
/>`,
          );

          // then
          assert.dom(screen.getByRole('columnheader', { name: 'Accessibilité' })).exists();
          assert.dom(screen.getByRole('cell', { name: '-' })).exists();
        });
      });
    });

    module('when feature toggle isNeedToAdjustCertificationAccessibilityEnabled is false', function () {
      test('should not display accessibility adjusted certification needed information', async function (assert) {
        // given
        const candidate = _buildCertificationCandidate({
          birthdate: new Date('2019-04-28'),
          accessibilityAdjustmentNeeded: true,
        });

        const countries = store.createRecord('country', { name: 'CANADA', code: 99401 });
        const certificationCandidate = store.createRecord('certification-candidate', candidate);

        this.set('certificationCandidates', [certificationCandidate]);
        this.set('countries', [countries]);

        // when
        const screen = await renderScreen(
          hbs`<EnrolledCandidates
  @sessionId='1'
  @certificationCandidates={{this.certificationCandidates}}
  @displayComplementaryCertification={{this.displayComplementaryCertification}}
  @countries={{this.countries}}
  @complementaryCertifications={{this.complementaryCertifications}}
/>`,
        );

        // then
        assert.dom(screen.queryByRole('columnheader', { name: 'Accessibilité' })).doesNotExist();
        assert.dom(screen.queryByRole('cell', { name: 'Oui' })).doesNotExist();
      });

      test('it does not display candidates with an edit button', async function (assert) {
        // given
        const certificationCandidates = [
          _buildCertificationCandidate({
            id: 1,
            firstName: 'Riri',
            lastName: 'Duck',
            isLinked: false,
            subscriptions: [],
          }),
          _buildCertificationCandidate({
            id: 2,
            firstName: 'Fifi',
            lastName: 'Duck',
            isLinked: true,
            subscriptions: [],
          }),
        ].map((candidateData) => store.createRecord('certification-candidate', candidateData));
        const countries = store.createRecord('country', { name: 'CANADA', code: 99401 });

        this.set('countries', [countries]);
        this.set('certificationCandidates', certificationCandidates);

        // when
        const screen = await renderScreen(hbs`<EnrolledCandidates
  @sessionId='1'
  @certificationCandidates={{this.certificationCandidates}}
  @countries={{this.countries}}
/>`);

        // then
        assert.dom(screen.queryByRole('button', { name: 'Editer le candidat Riri Duck' })).doesNotExist();
        assert.dom(screen.queryByRole('button', { name: 'Editer le candidat Fifi Duck' })).doesNotExist();
      });
    });
  });

  test('it displays specific subscription text when candidate subscribed to dual certification core/clea', async function (assert) {
    // given
    const cleaCertificationId = 2;
    const coreSubscription = store.createRecord('subscription', {
      type: SUBSCRIPTION_TYPES.CORE,
      complementaryCertificationId: null,
    });
    const complementarySubscription = store.createRecord('subscription', {
      type: SUBSCRIPTION_TYPES.COMPLEMENTARY,
      complementaryCertificationId: cleaCertificationId,
    });
    const candidate = _buildCertificationCandidate({
      birthdate: new Date('2019-04-28'),
      subscriptions: [coreSubscription, complementarySubscription],
    });
    const complementaryCertification = {
      id: cleaCertificationId,
      label: 'cléa num',
      key: COMPLEMENTARY_KEYS.CLEA,
    };

    const countries = store.createRecord('country', { name: 'CANADA', code: 99401 });
    const certificationCandidate = store.createRecord('certification-candidate', candidate);

    this.set('certificationCandidates', [certificationCandidate]);
    this.set('complementaryCertifications', [complementaryCertification]);
    this.set('countries', [countries]);

    // when
    const screen = await renderScreen(
      hbs`<EnrolledCandidates
  @sessionId='1'
  @certificationCandidates={{this.certificationCandidates}}
  @countries={{this.countries}}
  @complementaryCertifications={{this.complementaryCertifications}}
/>`,
    );

    // then
    assert.dom(screen.getByRole('cell', { name: 'Double Certification Pix-CléA Numérique' })).exists();
  });

  test('it should display details button', async function (assert) {
    // given
    const candidate = _buildCertificationCandidate({
      subscriptions: [],
    });
    const certificationCandidates = [store.createRecord('certification-candidate', candidate)];
    const countries = store.createRecord('country', { name: 'CANADA', code: 99401 });

    this.set('certificationCandidates', certificationCandidates);
    this.set('countries', [countries]);

    // when
    const screen = await renderScreen(hbs`<EnrolledCandidates
  @sessionId='1'
  @certificationCandidates={{this.certificationCandidates}}
  @countries={{this.countries}}
/>`);

    // then
    assert
      .dom(
        screen.getByRole('button', { name: `Voir le détail du candidat ${candidate.firstName} ${candidate.lastName}` }),
      )
      .isVisible();
  });

  test('it display candidates with delete disabled button if linked', async function (assert) {
    // given
    const certificationCandidates = [
      _buildCertificationCandidate({ id: 1, firstName: 'Riri', lastName: 'Duck', isLinked: false, subscriptions: [] }),
      _buildCertificationCandidate({ id: 2, firstName: 'Fifi', lastName: 'Duck', isLinked: true, subscriptions: [] }),
      _buildCertificationCandidate({
        id: 3,
        firstName: 'Loulou',
        lastName: 'Duck',
        isLinked: false,
        subscriptions: [],
      }),
    ].map((candidateData) => store.createRecord('certification-candidate', candidateData));
    const countries = store.createRecord('country', { name: 'CANADA', code: 99401 });

    this.set('countries', [countries]);
    this.set('certificationCandidates', certificationCandidates);

    // when
    const screen = await renderScreen(hbs`<EnrolledCandidates
  @sessionId='1'
  @certificationCandidates={{this.certificationCandidates}}
  @countries={{this.countries}}
/>`);

    // then
    assert
      .dom(screen.getByRole('button', { name: 'Supprimer le candidat Riri Duck' }))
      .hasClass(DELETE_BUTTON_SELECTOR);
    assert
      .dom(screen.getByRole('button', { name: 'Supprimer le candidat Fifi Duck' }))
      .hasClass(DELETE_BUTTON_DISABLED_SELECTOR);
    assert
      .dom(screen.getByRole('button', { name: 'Supprimer le candidat Loulou Duck' }))
      .hasClass(DELETE_BUTTON_SELECTOR);
  });

  module('when certification center is not SCO', function () {
    test('it displays candidate billing information', async function (assert) {
      // given
      this.set('shouldDisplayPaymentOptions', true);
      const candidate = _buildCertificationCandidate({
        billingMode: 'PREPAID',
        prepaymentCode: 'CODE01',
        subscriptions: [],
      });

      const certificationCandidate = store.createRecord('certification-candidate', candidate);
      const countries = store.createRecord('country', { name: 'CANADA', code: 99401 });

      this.set('countries', [countries]);
      this.set('certificationCandidates', [certificationCandidate]);

      // when
      const screen = await renderScreen(hbs`<EnrolledCandidates
  @sessionId='1'
  @certificationCandidates={{this.certificationCandidates}}
  @shouldDisplayPaymentOptions={{this.shouldDisplayPaymentOptions}}
  @countries={{this.countries}}
/>`);

      // then
      assert.dom(screen.queryByRole('columnheader', { name: 'Tarification part Pix' })).exists();
      assert.dom(screen.getByRole('cell', { name: 'Prépayée CODE01' })).exists();
    });
  });

  module('add student(s) button', () => {
    [
      {
        shouldDisplayPrescriptionScoStudentRegistrationFeature: true,
        multipleButtonVisible: true,
        it: 'it does display button to add multiple candidates if prescription sco feature is allowed',
      },
      {
        shouldDisplayPrescriptionScoStudentRegistrationFeature: false,
        multipleButtonVisible: false,
        it: 'it does not display button to add multiple candidates if prescription sco feature is not allowed',
      },
    ].forEach(({ shouldDisplayPrescriptionScoStudentRegistrationFeature, multipleButtonVisible, it }) =>
      test(it, async function (assert) {
        // given
        const certificationCandidates = [];
        const countries = store.createRecord('country', { name: 'CANADA', code: 99401 });

        this.set('countries', [countries]);
        this.set('certificationCandidates', certificationCandidates);
        this.set(
          'shouldDisplayPrescriptionScoStudentRegistrationFeature',
          shouldDisplayPrescriptionScoStudentRegistrationFeature,
        );

        // when
        const screen = await renderScreen(hbs`<EnrolledCandidates
  @sessionId='1'
  @certificationCandidates={{this.certificationCandidates}}
  @shouldDisplayPrescriptionScoStudentRegistrationFeature={{this.shouldDisplayPrescriptionScoStudentRegistrationFeature}}
  @countries={{this.countries}}
/>`);

        // then
        if (multipleButtonVisible) {
          assert.dom(screen.getByRole('link', { name: 'Inscrire des candidats' })).isVisible();
          assert.dom(screen.queryByRole('button', { name: 'Inscrire un candidat' })).isNotVisible();
        } else {
          assert.dom(screen.queryByRole('link', { name: 'Inscrire des candidats' })).isNotVisible();
          assert.dom(screen.getByRole('button', { name: 'Inscrire un candidat' })).isVisible();
        }
      }),
    );
  });

  [
    {
      shouldDisplayPrescriptionScoStudentRegistrationFeature: true,
      shouldColumnsBeEmpty: true,
      it: 'it hides externalId and email columns if prescription sco feature allowed',
    },
    {
      shouldDisplayPrescriptionScoStudentRegistrationFeature: false,
      shouldColumnsBeEmpty: false,
      it: 'it shows externalId and email columns if prescription sco feature not allowed',
    },
  ].forEach(({ shouldDisplayPrescriptionScoStudentRegistrationFeature, shouldColumnsBeEmpty, it }) =>
    test(it, async function (assert) {
      // given
      const candidate = _buildCertificationCandidate({
        subscriptions: [],
      });
      const countries = store.createRecord('country', { name: 'CANADA', code: 99401 });
      const certificationCandidate = store.createRecord('certification-candidate', candidate);

      this.set('countries', [countries]);
      this.set('certificationCandidates', [certificationCandidate]);
      this.set(
        'shouldDisplayPrescriptionScoStudentRegistrationFeature',
        shouldDisplayPrescriptionScoStudentRegistrationFeature,
      );

      // when
      const screen = await renderScreen(hbs`<EnrolledCandidates
  @sessionId='1'
  @certificationCandidates={{this.certificationCandidates}}
  @shouldDisplayPrescriptionScoStudentRegistrationFeature={{this.shouldDisplayPrescriptionScoStudentRegistrationFeature}}
  @countries={{this.countries}}
/>`);

      // then
      if (shouldColumnsBeEmpty) {
        assert.dom(screen.queryByRole('cell', { name: candidate.externalId })).doesNotExist();
        assert.dom(screen.queryByRole('cell', { name: candidate.resultRecipientEmail })).doesNotExist();
      } else {
        assert.dom(screen.getByRole('cell', { name: candidate.externalId })).exists();
        assert.dom(screen.getByRole('cell', { name: candidate.resultRecipientEmail })).exists();
      }
    }),
  );

  module('Core complementary compatibility tooltip', function () {
    test('it should not display tooltip in the header of selected certification column when certif center has not compatibility enabled ', async function (assert) {
      //given
      const candidate = _buildCertificationCandidate({
        subscriptions: [],
      });

      const certificationCandidate = store.createRecord('certification-candidate', candidate);
      const countries = store.createRecord('country', { name: 'CANADA', code: 99401 });

      this.set('certificationCandidates', [certificationCandidate]);
      this.set('countries', [countries]);

      // when
      const screen = await renderScreen(hbs`<EnrolledCandidates
  @sessionId='1'
  @certificationCandidates={{this.certificationCandidates}}
  @countries={{this.countries}}
/>`);

      // then
      assert.dom(screen.queryByLabelText("Informations concernant l'inscription en certification.")).doesNotExist();
    });

    test('it should display tooltip in the header of selected certification column when certif center has compatibility enabled', async function (assert) {
      //given
      const store = this.owner.lookup('service:store');
      class CurrentUserStub extends Service {
        currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
          habilitations: [
            { id: '0', label: 'Certif complémentaire 1', key: 'COMP_1' },
            { id: '1', label: 'Certif complémentaire 2', key: 'COMP_2' },
          ],
          isComplementaryAlonePilot: true,
          isV3Pilot: true,
        });
      }
      this.owner.register('service:current-user', CurrentUserStub);
      const candidate = _buildCertificationCandidate({
        subscriptions: [],
      });

      const certificationCandidate = store.createRecord('certification-candidate', candidate);
      const countries = store.createRecord('country', { name: 'CANADA', code: 99401 });

      this.set('certificationCandidates', [certificationCandidate]);
      this.set('countries', [countries]);

      // when
      const screen = await renderScreen(hbs`<EnrolledCandidates
  @sessionId='1'
  @certificationCandidates={{this.certificationCandidates}}
  @countries={{this.countries}}
/>`);
      const tooltipLabel = screen.getByText(t('pages.sessions.detail.candidates.list.compatibility-tooltip'), {
        options: { exact: false },
      });
      await click(tooltipLabel);

      // then
      assert.dom(tooltipLabel).isVisible();
    });
  });
});

function _buildCertificationCandidate({
  id = '12345',
  firstName = 'Bob',
  lastName = 'Leponge',
  birthdate = new Date(),
  birthCity = 'Marseille',
  birthProvinceCode = '',
  birthCountry = '',
  email = 'bob.leponge@la.mer',
  resultRecipientEmail = 'recipient@college.fr',
  externalId = 'an external id',
  extraTimePercentage = 0.3,
  isLinked = false,
  billingMode = null,
  prepaymentCode = null,
  accessibilityAdjustmentNeeded = false,
  subscriptions = [],
}) {
  return {
    id,
    firstName,
    lastName,
    birthdate,
    birthCity,
    birthProvinceCode,
    birthCountry,
    email,
    resultRecipientEmail,
    externalId,
    extraTimePercentage,
    isLinked,
    billingMode,
    prepaymentCode,
    accessibilityAdjustmentNeeded,
    subscriptions,
  };
}
