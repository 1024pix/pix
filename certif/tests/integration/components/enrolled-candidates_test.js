import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { render as renderScreen } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | enrolled-candidates', function (hooks) {
  setupIntlRenderingTest(hooks);

  const DELETE_BUTTON_SELECTOR = 'certification-candidates-actions__delete-button';
  const DELETE_BUTTON_DISABLED_SELECTOR = `${DELETE_BUTTON_SELECTOR}--disabled`;

  let store;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
  });

  test('it should have an accessible table description', async function (assert) {
    //given
    const candidate = _buildCertificationCandidate({
      birthdate: new Date('2019-04-28'),
    });

    const certificationCandidate = store.createRecord('certification-candidate', candidate);

    this.set('certificationCandidates', [certificationCandidate]);

    // when
    const screen = await renderScreen(hbs`
        <EnrolledCandidates
          @sessionId="1"
          @certificationCandidates={{this.certificationCandidates}}
          >
        </EnrolledCandidates>
      `);

    // then
    assert
      .dom(
        screen.getByRole('table', {
          name: this.intl.t('pages.sessions.detail.candidates.list.with-details-description'),
        })
      )
      .exists();
  });

  test('it displays candidate information', async function (assert) {
    // given
    this.set('displayComplementaryCertification', true);
    const candidate = _buildCertificationCandidate({
      birthdate: new Date('2019-04-28'),
    });

    const certificationCandidate = store.createRecord('certification-candidate', candidate);

    this.set('certificationCandidates', [certificationCandidate]);

    // when
    const screen = await renderScreen(hbs`
        <EnrolledCandidates
          @sessionId="1"
          @certificationCandidates={{this.certificationCandidates}}
          @displayComplementaryCertification={{this.displayComplementaryCertification}}
          >
        </EnrolledCandidates>
      `);

    // then
    assert.dom(screen.getByRole('cell', { name: certificationCandidate.externalId })).exists();
    assert.dom(screen.getByRole('cell', { name: certificationCandidate.lastName })).exists();
    assert.dom(screen.getByRole('cell', { name: certificationCandidate.firstName })).exists();
    assert.dom(screen.getByRole('cell', { name: certificationCandidate.resultRecipientEmail })).exists();
    assert.dom(screen.getByRole('cell', { name: '3000 %' })).exists();
    assert.dom(screen.getByRole('cell', { name: 'Pix+Edu, Pix+Droit' })).exists();
    assert.dom(screen.queryByRole('cell', { name: certificationCandidate.birthCity })).doesNotExist();
    assert.dom(screen.queryByRole('cell', { name: certificationCandidate.birthProvinceCode })).doesNotExist();
    assert.dom(screen.queryByRole('cell', { name: certificationCandidate.birthCountry })).doesNotExist();
    assert.dom(screen.queryByRole('cell', { name: certificationCandidate.email })).doesNotExist();
  });

  test('it displays a dash where there is no certification', async function (assert) {
    // given
    this.set('displayComplementaryCertification', true);
    const candidate = _buildCertificationCandidate({
      complementaryCertifications: null,
    });

    const certificationCandidate = store.createRecord('certification-candidate', candidate);

    this.set('certificationCandidates', [certificationCandidate]);

    // when
    const screen = await renderScreen(hbs`
        <EnrolledCandidates
          @sessionId="1"
          @certificationCandidates={{this.certificationCandidates}}
          @displayComplementaryCertification={{this.displayComplementaryCertification}}
          >
        </EnrolledCandidates>
      `);

    // then
    assert.dom(screen.getByRole('cell', { name: '-' })).exists();
  });

  test('it should display details button', async function (assert) {
    // given
    const candidate = _buildCertificationCandidate({});
    const certificationCandidates = [candidate];

    this.set('certificationCandidates', certificationCandidates);

    // when
    const screen = await renderScreen(hbs`
        <EnrolledCandidates
          @sessionId="1"
          @certificationCandidates={{this.certificationCandidates}}
        >
        </EnrolledCandidates>
    `);

    // then
    assert
      .dom(
        screen.getByRole('button', { name: `Voir le détail du candidat ${candidate.firstName} ${candidate.lastName}` })
      )
      .isVisible();
  });

  test('it display candidates with delete disabled button if linked', async function (assert) {
    // given
    const certificationCandidates = [
      _buildCertificationCandidate({ firstName: 'Riri', lastName: 'Duck', isLinked: false }),
      _buildCertificationCandidate({ firstName: 'Fifi', lastName: 'Duck', isLinked: true }),
      _buildCertificationCandidate({ firstName: 'Loulou', lastName: 'Duck', isLinked: false }),
    ];

    this.set('certificationCandidates', certificationCandidates);

    // when
    const screen = await renderScreen(hbs`
      <EnrolledCandidates
        @sessionId="1"
        @certificationCandidates={{this.certificationCandidates}}>
      </EnrolledCandidates>
    `);

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
        billingMode: 'Prepayée',
        prepaymentCode: 'CODE01',
      });

      const certificationCandidate = store.createRecord('certification-candidate', candidate);

      this.set('certificationCandidates', [certificationCandidate]);

      // when
      const screen = await renderScreen(hbs`
          <EnrolledCandidates
            @sessionId="1"
            @certificationCandidates={{this.certificationCandidates}}
            @shouldDisplayPaymentOptions={{this.shouldDisplayPaymentOptions}}
            >
          </EnrolledCandidates>
        `);

      // then
      assert.dom(screen.queryByRole('columnheader', { name: 'Tarification part Pix' })).exists();
      assert.dom(screen.getByRole('cell', { name: 'Prepayée CODE01' })).exists();
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

        this.set('certificationCandidates', certificationCandidates);
        this.set(
          'shouldDisplayPrescriptionScoStudentRegistrationFeature',
          shouldDisplayPrescriptionScoStudentRegistrationFeature
        );

        // when
        const screen = await renderScreen(hbs`
          <EnrolledCandidates
            @sessionId="1"
            @certificationCandidates={{this.certificationCandidates}}
            @shouldDisplayPrescriptionScoStudentRegistrationFeature={{this.shouldDisplayPrescriptionScoStudentRegistrationFeature}}
          >
          </EnrolledCandidates>
        `);

        // then
        if (multipleButtonVisible) {
          assert.dom(screen.getByRole('link', { name: 'Inscrire des candidats' })).isVisible();
          assert.dom(screen.queryByRole('button', { name: 'Inscrire un candidat' })).isNotVisible();
        } else {
          assert.dom(screen.queryByRole('link', { name: 'Inscrire des candidats' })).isNotVisible();
          assert.dom(screen.getByRole('button', { name: 'Inscrire un candidat' })).isVisible();
        }
      })
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
      const candidate = _buildCertificationCandidate({});

      this.set('certificationCandidates', [candidate]);
      this.set(
        'shouldDisplayPrescriptionScoStudentRegistrationFeature',
        shouldDisplayPrescriptionScoStudentRegistrationFeature
      );

      // when
      const screen = await renderScreen(hbs`
        <EnrolledCandidates
          @sessionId="1"
          @certificationCandidates={{this.certificationCandidates}}
          @shouldDisplayPrescriptionScoStudentRegistrationFeature={{this.shouldDisplayPrescriptionScoStudentRegistrationFeature}}
        >
        </EnrolledCandidates>
    `);

      // then
      if (shouldColumnsBeEmpty) {
        assert.dom(screen.queryByRole('cell', { name: candidate.externalId })).doesNotExist();
        assert.dom(screen.queryByRole('cell', { name: candidate.resultRecipientEmail })).doesNotExist();
      } else {
        assert.dom(screen.getByRole('cell', { name: candidate.externalId })).exists();
        assert.dom(screen.getByRole('cell', { name: candidate.resultRecipientEmail })).exists();
      }
    })
  );
});

function _buildCertificationCandidate({
  id = 12345,
  firstName = 'Bob',
  lastName = 'Leponge',
  birthdate = new Date(),
  birthCity = 'Marseille',
  birthProvinceCode = '',
  birthCountry = '',
  email = 'bob.leponge@la.mer',
  resultRecipientEmail = 'recipient@college.fr',
  externalId = 'an external id',
  extraTimePercentage = 30,
  isLinked = false,
  complementaryCertifications = [
    {
      id: 1,
      label: 'Pix+Edu',
    },
    {
      id: 2,
      label: 'Pix+Droit',
    },
  ],
  billingMode = '',
  prepaymentCode = null,
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
    complementaryCertifications,
    billingMode,
    prepaymentCode,
  };
}
