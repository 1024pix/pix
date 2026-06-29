import { render } from '@1024pix/ember-testing-library';
import CertificationVersionDetailModal from 'pix-admin/components/certification-frameworks/certification-framework/modal/certification-version-detail-modal';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest, { t } from '../../../../../helpers/setup-intl-rendering';

module(
  'Integration | Component | certification-frameworks/certification-framework/Framework | Certification version detail modal',
  function (hooks) {
    setupIntlRenderingTest(hooks);

    let store;
    hooks.beforeEach(function () {
      store = this.owner.lookup('service:store');
    });

    function buildVersion(overrides = {}) {
      return {
        startDate: new Date('2024-01-01'),
        expirationDate: null,
        assessmentDuration: 105,
        minimumAnswersRequiredForValidation: 20,
        maximumAssessmentLength: 32,
        comments: '',
        areas: [],
        save: sinon.stub().resolves(),
        ...overrides,
      };
    }

    test('it displays the framework label as modal title', async function (assert) {
      // given
      const version = buildVersion();
      const onClose = sinon.stub();

      // when
      const screen = await render(
        <template>
          <CertificationVersionDetailModal
            @version={{version}}
            @status="ACTIVE"
            @frameworkKey="CORE"
            @onClose={{onClose}}
            @showModal={{true}}
          />
        </template>,
      );

      // then
      assert.dom(screen.getByRole('heading', { name: t('components.certification-frameworks.labels.CORE') })).exists();
    });

    test('it displays the version status tag', async function (assert) {
      // given
      const version = buildVersion();
      const onClose = sinon.stub();

      // when
      const screen = await render(
        <template>
          <CertificationVersionDetailModal
            @version={{version}}
            @status="ACTIVE"
            @frameworkKey="CORE"
            @onClose={{onClose}}
            @showModal={{true}}
          />
        </template>,
      );

      // then
      assert
        .dom(screen.getByText(t('components.certification-frameworks.certification-framework.history.statuses.ACTIVE')))
        .exists();
    });

    test('it displays the start date', async function (assert) {
      // given
      const version = buildVersion({ startDate: new Date('2024-06-15') });
      const onClose = sinon.stub();

      // when
      const screen = await render(
        <template>
          <CertificationVersionDetailModal
            @version={{version}}
            @status="ACTIVE"
            @frameworkKey="CORE"
            @onClose={{onClose}}
            @showModal={{true}}
          />
        </template>,
      );

      // then
      assert
        .dom(
          screen.getByText(
            t('components.certification-frameworks.certification-framework.version-detail-modal.start-date'),
          ),
        )
        .exists();
    });

    test('it displays the version areas', async function (assert) {
      // given
      const area = store.createRecord('area', {
        id: 'area1',
        title: 'Domaine test',
        code: '1',
        color: 'red',
        frameworkId: 'fw1',
      });
      const version = buildVersion({ areas: [area] });
      const onClose = sinon.stub();

      // when
      const screen = await render(
        <template>
          <CertificationVersionDetailModal
            @version={{version}}
            @status="ACTIVE"
            @frameworkKey="CORE"
            @onClose={{onClose}}
            @showModal={{true}}
          />
        </template>,
      );

      // then
      assert.dom(screen.getByText('1 · Domaine test')).exists();
    });

    test('it displays the comment section with save button', async function (assert) {
      // given
      const version = buildVersion();
      const onClose = sinon.stub();

      // when
      const screen = await render(
        <template>
          <CertificationVersionDetailModal
            @version={{version}}
            @status="ACTIVE"
            @frameworkKey="CORE"
            @onClose={{onClose}}
            @showModal={{true}}
          />
        </template>,
      );

      // then
      assert.dom(screen.getByRole('button', { name: t('common.actions.save') })).exists();
    });

    test('if sould be hidden when showModal is false', async function (assert) {
      //given
      const area = store.createRecord('area', {
        id: 'area1',
        title: 'Domaine test',
        code: '1',
        color: 'red',
        frameworkId: 'fw1',
      });
      const version = buildVersion({ areas: [area] });
      const onClose = sinon.stub();

      //when
      const screen = await render(
        <template>
          <CertificationVersionDetailModal
            @version={{version}}
            @status="ACTIVE"
            @frameworkKey="CORE"
            @onClose={{onClose}}
            @showModal={{false}}
          />
        </template>,
      );

      assert.dom(screen.queryByRole('dialog')).doesNotExist();
    });
  },
);
