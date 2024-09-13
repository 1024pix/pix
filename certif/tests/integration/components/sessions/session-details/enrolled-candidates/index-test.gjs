import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import EnrolledCandidates from 'pix-certif/components/sessions/session-details/enrolled-candidates';
import { COMPLEMENTARY_KEYS, SUBSCRIPTION_TYPES } from 'pix-certif/models/subscription';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

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

    const certificationCandidates = [store.createRecord('certification-candidate', candidate)];
    const countries = [store.createRecord('country', { name: 'CANADA', code: 99401 })];

    // when
    const screen = await render(
      <template>
        <EnrolledCandidates
          @sessionId='1'
          @certificationCandidates={{certificationCandidates}}
          @countries={{countries}}
        />
      </template>,
    );

    // then
    assert
      .dom(
        screen.getByRole('table', {
          name: t('pages.sessions.detail.candidates.list.with-details-description'),
        }),
      )
      .exists();
  });

  test('it should display candidate information', async function (assert) {
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
    const complementaryCertifications = [
      {
        id: complementaryCertificationId,
        label: 'Pix+Droit',
      },
    ];

    const countries = [store.createRecord('country', { name: 'CANADA', code: 99401 })];
    const certificationCandidates = [store.createRecord('certification-candidate', candidate)];

    // when
    const screen = await render(
      <template>
        <EnrolledCandidates
          @sessionId='1'
          @certificationCandidates={{certificationCandidates}}
          @countries={{countries}}
          @complementaryCertifications={{complementaryCertifications}}
        />
      </template>,
    );

    // then
    assert.dom(screen.queryByRole('columnheader', { name: 'Accessibilité' })).doesNotExist();
    assert.dom(screen.getByRole('cell', { name: certificationCandidates[0].externalId })).exists();
    assert.dom(screen.getByRole('cell', { name: certificationCandidates[0].lastName })).exists();
    assert.dom(screen.getByRole('cell', { name: certificationCandidates[0].firstName })).exists();
    assert.dom(screen.getByRole('cell', { name: certificationCandidates[0].resultRecipientEmail })).exists();
    assert.dom(screen.getByRole('cell', { name: '30 %' })).exists();
    assert.dom(screen.getByRole('cell', { name: 'Certification Pix, Pix+Droit' })).exists();
    assert.dom(screen.queryByRole('cell', { name: certificationCandidates[0].birthCity })).doesNotExist();
    assert.dom(screen.queryByRole('cell', { name: certificationCandidates[0].birthProvinceCode })).doesNotExist();
    assert.dom(screen.queryByRole('cell', { name: certificationCandidates[0].birthCountry })).doesNotExist();
    assert.dom(screen.queryByRole('cell', { name: certificationCandidates[0].email })).doesNotExist();
  });

  test('it should display details button', async function (assert) {
    // given
    const candidate = _buildCertificationCandidate({
      subscriptions: [],
    });
    const certificationCandidates = [store.createRecord('certification-candidate', candidate)];
    const countries = [store.createRecord('country', { name: 'CANADA', code: 99401 })];

    // when
    const screen = await render(
      <template>
        <EnrolledCandidates
          @sessionId='1'
          @certificationCandidates={{certificationCandidates}}
          @countries={{countries}}
        />
      </template>,
    );

    // then
    assert
      .dom(
        screen.getByRole('button', { name: `Voir le détail du candidat ${candidate.firstName} ${candidate.lastName}` }),
      )
      .isVisible();
  });

  test('it should display details modal', async function (assert) {
    // given
    const candidate = _buildCertificationCandidate({
      subscriptions: [],
    });
    const certificationCandidates = [store.createRecord('certification-candidate', candidate)];
    const countries = [store.createRecord('country', { name: 'CANADA', code: 99401 })];

    // when
    const screen = await render(
      <template>
        <EnrolledCandidates
          @sessionId='1'
          @certificationCandidates={{certificationCandidates}}
          @countries={{countries}}
        />
      </template>,
    );

    await click(
      screen.getByRole('button', {
        name: `Voir le détail du candidat ${candidate.firstName} ${candidate.lastName}`,
      }),
    );

    // then
    const modalTitle = await screen.getByRole('heading', { name: 'Détail du candidat' });
    assert.dom(modalTitle).exists();
  });

  module('when candidate has NOT started a certification session', function () {
    test('it should be possible to delete the candidate', async function (assert) {
      // given
      const certificationCandidates = [
        _buildCertificationCandidate({
          id: 1,
          firstName: 'Riri',
          lastName: 'Duck',
          subscriptions: [],
        }),
        _buildCertificationCandidate({ id: 2, firstName: 'Fifi', lastName: 'Duck', subscriptions: [] }),
        _buildCertificationCandidate({
          id: 3,
          firstName: 'Loulou',
          lastName: 'Duck',
          subscriptions: [],
        }),
      ].map((candidateData) => store.createRecord('certification-candidate', candidateData));
      const countries = [store.createRecord('country', { name: 'CANADA', code: 99401 })];

      certificationCandidates[0].destroyRecord = sinon.stub();
      certificationCandidates[1].destroyRecord = sinon.stub();
      certificationCandidates[2].destroyRecord = sinon.stub();

      // when
      const screen = await render(
        <template>
          <EnrolledCandidates
            @sessionId='1'
            @certificationCandidates={{certificationCandidates}}
            @countries={{countries}}
          />
        </template>,
      );

      await click(screen.getByRole('button', { name: 'Supprimer le candidat Riri Duck' }));

      // then
      sinon.assert.calledOnce(certificationCandidates[0].destroyRecord);
      sinon.assert.notCalled(certificationCandidates[1].destroyRecord);
      sinon.assert.notCalled(certificationCandidates[2].destroyRecord);
      assert.ok(true);
    });
  });

  module('when candidate has started a certification session', function () {
    test('it display candidates with delete button disabled', async function (assert) {
      // given
      const certificationCandidates = [
        _buildCertificationCandidate({
          id: 1,
          firstName: 'Riri',
          lastName: 'Duck',
          isLinked: false,
          subscriptions: [],
        }),
        _buildCertificationCandidate({ id: 2, firstName: 'Fifi', lastName: 'Duck', isLinked: true, subscriptions: [] }),
        _buildCertificationCandidate({
          id: 3,
          firstName: 'Loulou',
          lastName: 'Duck',
          isLinked: false,
          subscriptions: [],
        }),
      ].map((candidateData) => store.createRecord('certification-candidate', candidateData));
      const countries = [store.createRecord('country', { name: 'CANADA', code: 99401 })];

      // when
      const screen = await render(
        <template>
          <EnrolledCandidates
            @sessionId='1'
            @certificationCandidates={{certificationCandidates}}
            @countries={{countries}}
          />
        </template>,
      );

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
        const countries = [store.createRecord('country', { name: 'CANADA', code: 99401 })];

        // when
        const screen = await render(
          <template>
            <EnrolledCandidates
              @sessionId='1'
              @certificationCandidates={{certificationCandidates}}
              @countries={{countries}}
            />
          </template>,
        );

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

          const countries = [store.createRecord('country', { name: 'CANADA', code: 99401 })];
          const certificationCandidates = [store.createRecord('certification-candidate', candidate)];

          // when
          const screen = await render(
            <template>
              <EnrolledCandidates
                @sessionId='1'
                @certificationCandidates={{certificationCandidates}}
                @countries={{countries}}
              />
            </template>,
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

          const countries = [store.createRecord('country', { name: 'CANADA', code: 99401 })];
          const certificationCandidates = [store.createRecord('certification-candidate', candidate)];

          // when
          const screen = await render(
            <template>
              <EnrolledCandidates
                @sessionId='1'
                @certificationCandidates={{certificationCandidates}}
                @countries={{countries}}
              />
            </template>,
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

        const countries = [store.createRecord('country', { name: 'CANADA', code: 99401 })];
        const certificationCandidates = [store.createRecord('certification-candidate', candidate)];
        const displayComplementaryCertification = sinon.stub();
        const complementaryCertifications = [];

        // when
        const screen = await render(
          <template>
            <EnrolledCandidates
              @sessionId='1'
              @certificationCandidates={{certificationCandidates}}
              @displayComplementaryCertification={{displayComplementaryCertification}}
              @countries={{countries}}
              @complementaryCertifications={{complementaryCertifications}}
            />
          </template>,
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
        const countries = [store.createRecord('country', { name: 'CANADA', code: 99401 })];

        // when
        const screen = await render(
          <template>
            <EnrolledCandidates
              @sessionId='1'
              @certificationCandidates={{certificationCandidates}}
              @countries={{countries}}
            />
          </template>,
        );

        // then
        assert.dom(screen.queryByRole('button', { name: 'Editer le candidat Riri Duck' })).doesNotExist();
        assert.dom(screen.queryByRole('button', { name: 'Editer le candidat Fifi Duck' })).doesNotExist();
      });
    });
  });

  module('When candidate subscribed to dual certification core/clea', function () {
    test('it displays specific subscription text', async function (assert) {
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
      const complementaryCertifications = [
        {
          id: cleaCertificationId,
          label: 'cléa num',
          key: COMPLEMENTARY_KEYS.CLEA,
        },
      ];

      const countries = [store.createRecord('country', { name: 'CANADA', code: 99401 })];
      const certificationCandidates = [store.createRecord('certification-candidate', candidate)];

      // when
      const screen = await render(
        <template>
          <EnrolledCandidates
            @sessionId='1'
            @certificationCandidates={{certificationCandidates}}
            @countries={{countries}}
            @complementaryCertifications={{complementaryCertifications}}
          />
        </template>,
      );

      // then
      assert.dom(screen.getByRole('cell', { name: 'Double Certification Pix-CléA Numérique' })).exists();
    });
  });

  module('when certification center is not SCO', function () {
    test('it displays candidate billing information', async function (assert) {
      // given
      const candidate = _buildCertificationCandidate({
        billingMode: 'PREPAID',
        prepaymentCode: 'CODE01',
        subscriptions: [],
      });

      const certificationCandidates = [store.createRecord('certification-candidate', candidate)];
      const countries = [store.createRecord('country', { name: 'CANADA', code: 99401 })];

      // when
      const screen = await render(
        <template>
          <EnrolledCandidates
            @sessionId='1'
            @certificationCandidates={{certificationCandidates}}
            @shouldDisplayPaymentOptions={{true}}
            @countries={{countries}}
          />
        </template>,
      );

      // then
      assert.dom(screen.queryByRole('columnheader', { name: 'Tarification part Pix' })).exists();
      assert.dom(screen.getByRole('cell', { name: 'Prépayée CODE01' })).exists();
    });
  });

  module('when prescription SCO is allowed', function () {
    test('it should display button to add multiple candidates', async function (assert) {
      // given
      const certificationCandidates = [];
      const countries = [store.createRecord('country', { name: 'CANADA', code: 99401 })];

      // when
      const screen = await render(
        <template>
          <EnrolledCandidates
            @sessionId='1'
            @certificationCandidates={{certificationCandidates}}
            @shouldDisplayPrescriptionScoStudentRegistrationFeature={{true}}
            @countries={{countries}}
          />
        </template>,
      );

      // then
      assert.dom(screen.getByRole('link', { name: 'Inscrire des candidats' })).isVisible();
      assert.dom(screen.queryByRole('button', { name: 'Inscrire un candidat' })).isNotVisible();
    });

    test('it hides externalId and email column', async function (assert) {
      // given
      const candidate = _buildCertificationCandidate({
        subscriptions: [],
      });
      const certificationCandidates = [store.createRecord('certification-candidate', candidate)];
      const countries = [store.createRecord('country', { name: 'CANADA', code: 99401 })];

      // when
      const screen = await render(
        <template>
          <EnrolledCandidates
            @sessionId='1'
            @certificationCandidates={{certificationCandidates}}
            @shouldDisplayPrescriptionScoStudentRegistrationFeature={{true}}
            @countries={{countries}}
          />
        </template>,
      );

      // then
      assert.dom(screen.queryByRole('cell', { name: candidate.externalId })).doesNotExist();
      assert.dom(screen.queryByRole('cell', { name: candidate.resultRecipientEmail })).doesNotExist();
    });
  });

  module('when prescription SCO is NOT allowed', function () {
    test('it should NOT display button to add multiple candidates', async function (assert) {
      // given
      const certificationCandidates = [];
      const countries = [store.createRecord('country', { name: 'CANADA', code: 99401 })];

      // when
      const screen = await render(
        <template>
          <EnrolledCandidates
            @sessionId='1'
            @certificationCandidates={{certificationCandidates}}
            @shouldDisplayPrescriptionScoStudentRegistrationFeature={{false}}
            @countries={{countries}}
          />
        </template>,
      );

      // then
      assert.dom(screen.queryByRole('link', { name: 'Inscrire des candidats' })).isNotVisible();
      assert.dom(screen.getByRole('button', { name: 'Inscrire un candidat' })).isVisible();
    });

    test('it shows externalId and email columns', async function (assert) {
      // given
      const candidate = _buildCertificationCandidate({
        subscriptions: [],
      });
      const certificationCandidates = [store.createRecord('certification-candidate', candidate)];
      const countries = [store.createRecord('country', { name: 'CANADA', code: 99401 })];

      // when
      const screen = await render(
        <template>
          <EnrolledCandidates
            @sessionId='1'
            @certificationCandidates={{certificationCandidates}}
            @shouldDisplayPrescriptionScoStudentRegistrationFeature={{false}}
            @countries={{countries}}
          />
        </template>,
      );

      // then
      assert.dom(screen.getByRole('cell', { name: candidate.externalId })).exists();
      assert.dom(screen.getByRole('cell', { name: candidate.resultRecipientEmail })).exists();
    });
  });

  module('when certification center has core complementary compatibility enabled', function () {
    test('it should display tooltip in the header of selected certification column', async function (assert) {
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

      const certificationCandidates = [store.createRecord('certification-candidate', candidate)];
      const countries = [store.createRecord('country', { name: 'CANADA', code: 99401 })];

      // when
      const screen = await render(
        <template>
          <EnrolledCandidates
            @sessionId='1'
            @certificationCandidates={{certificationCandidates}}
            @countries={{countries}}
          />
        </template>,
      );
      const tooltipLabel = screen.getByText(t('pages.sessions.detail.candidates.list.compatibility-tooltip'), {
        options: { exact: false },
      });
      await click(tooltipLabel);

      // then
      assert.dom(tooltipLabel).isVisible();
    });
  });

  module('when certification center has NOT core complementary compatibility enabled', function () {
    test('it should NOT display tooltip in the header of selected certification column', async function (assert) {
      //given
      const candidate = _buildCertificationCandidate({
        subscriptions: [],
      });

      const certificationCandidates = [store.createRecord('certification-candidate', candidate)];
      const countries = [store.createRecord('country', { name: 'CANADA', code: 99401 })];

      // when
      const screen = await render(
        <template>
          <EnrolledCandidates
            @sessionId='1'
            @certificationCandidates={{certificationCandidates}}
            @countries={{countries}}
          />
        </template>,
      );

      // then
      assert.dom(screen.queryByLabelText("Informations concernant l'inscription en certification.")).doesNotExist();
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
