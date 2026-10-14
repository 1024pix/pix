import { render, within } from '@1024pix/ember-testing-library';
import { click, tab } from '@ember/test-helpers';
import userEvent from '@testing-library/user-event';
import { t } from 'ember-intl/test-support';
import CompetencesDetails from 'mon-pix/components/certifications/certificate-information/competences-details';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { stubCurrentUserService } from '../../../../helpers/service-stubs';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Certifications | Certificate | Competences details', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display component with competences ordered', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const resultCompetenceTree = _getCompetenceTree(store);
    const certification = store.createRecord('certification', {
      resultCompetenceTree,
    });

    // when
    const screen = await render(<template><CompetencesDetails @certificate={{certification}} /></template>);

    // then
    assert.dom(screen.getByRole('heading', { name: t('pages.certificate.details.competences.title') })).exists();

    const tablist = screen.getByRole('tablist', { name: t('pages.certificate.details.competences.title') });
    assert.dom(tablist).exists();
    assert.strictEqual(within(tablist).getAllByRole('tab').length, 2);
    assert.strictEqual(within(tablist).getAllByRole('tab')[0].textContent.trim(), '1. Domaine numéro 1');
    assert.strictEqual(within(tablist).getAllByRole('tab')[1].textContent.trim(), '2. Domaine 2');

    const tabpanel = screen.getByRole('tabpanel', { name: '1. Domaine numéro 1' });
    assert.dom(within(tabpanel).getByRole('heading', { name: /Domaine numéro 1/ })).exists();
    assert.strictEqual(within(tabpanel).getByRole('presentation').textContent.trim(), t('common.level'));

    const displayedCompetences = within(tabpanel).getAllByRole('listitem');
    assert.strictEqual(displayedCompetences.length, 3);
    // Competence 1
    assert.dom(within(displayedCompetences[0]).getByText('1.1 Competence 1 du domaine 1')).exists();
    assert.dom(within(displayedCompetences[0]).getByText('niveau')).exists();
    assert.dom(within(displayedCompetences[0]).getByText('3')).exists();
    // Competence 2
    assert.dom(within(displayedCompetences[1]).getByText('1.2 Competence 2 du domaine 1')).exists();
    assert.dom(within(displayedCompetences[1]).getByText('niveau')).exists();
    assert.dom(within(displayedCompetences[1]).getByText('6')).exists();
    // Competence 3
    assert.dom(within(displayedCompetences[2]).getByText('1.3 Competence 3 du domaine 1')).exists();
    assert.dom(within(displayedCompetences[2]).getByText('niveau')).exists();
    assert.dom(within(displayedCompetences[2]).getByText('1')).exists();
  });

  module('when algorithm engine version is v3', function () {
    module('when domain is fr', function () {
      test('should display a link to the results explanation', async function (assert) {
        // given
        const domainService = this.owner.lookup('service:currentDomain');
        sinon.stub(domainService, 'getExtension').returns('fr');

        const store = this.owner.lookup('service:store');
        const certification = store.createRecord('certification', {
          birthdate: '2000-01-22',
          date: new Date('2018-02-15T15:15:52Z'),
          isPublished: true,
          status: 'validated',
          version: 3,
          algorithmEngineVersion: 3,
        });

        // when
        const screen = await render(<template><CompetencesDetails @certificate={{certification}} /></template>);

        // then
        assert.dom(screen.getByText(t('pages.certificate.details.competences.description'))).exists();
        assert
          .dom(screen.getByRole('link', { name: t('pages.certificate.learn-about-certification-results') }))
          .hasAttribute('href', 'https://pix.fr/certification-comprendre-score-niveau');
      });
    });

    module('when domain is org', function () {
      module('when user is a french reader', function () {
        test('should display a link to the results explanation', async function (assert) {
          // given
          stubCurrentUserService(this.owner, { lang: 'fr' });
          const store = this.owner.lookup('service:store');
          const certification = store.createRecord('certification', {
            birthdate: '2000-01-22',
            date: new Date('2018-02-15T15:15:52Z'),
            isPublished: true,
            status: 'validated',
            version: 3,
            algorithmEngineVersion: 3,
          });

          // when
          const screen = await render(<template><CompetencesDetails @certificate={{certification}} /></template>);

          // then
          assert.dom(screen.getByText(t('pages.certificate.details.competences.description'))).exists();
          assert
            .dom(screen.getByRole('link', { name: t('pages.certificate.learn-about-certification-results') }))
            .hasAttribute('href', 'https://pix.org/fr/certification-comprendre-score-niveau');
        });
      });

      module('when user is not a french reader', function () {
        test('should not display a link to the results explanation', async function (assert) {
          // given
          stubCurrentUserService(this.owner, { lang: 'en' });
          const store = this.owner.lookup('service:store');
          const certification = store.createRecord('certification', {
            birthdate: '2000-01-22',
            date: new Date('2018-02-15T15:15:52Z'),
            isPublished: true,
            status: 'validated',
            version: 3,
            algorithmEngineVersion: 3,
          });

          // when
          const screen = await render(<template><CompetencesDetails @certificate={{certification}} /></template>);

          // then
          assert.dom(screen.getByText(t('pages.certificate.details.competences.description'))).exists();
          assert
            .dom(screen.queryByRole('link', { name: t('pages.certificate.learn-about-certification-results') }))
            .doesNotExist();
        });
      });
    });
  });

  module('when algorithm engine version is v2', function () {
    test('should not display a link to the results explanation', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const certification = store.createRecord('certification', {
        birthdate: '2000-01-22',
        date: new Date('2018-02-15T15:15:52Z'),
        isPublished: true,
        status: 'validated',
        version: 2,
        algorithmEngineVersion: 2,
      });

      // when
      const screen = await render(<template><CompetencesDetails @certificate={{certification}} /></template>);

      // then
      assert.dom(screen.getByText(t('pages.certificate.details.competences.description'))).exists();
      assert
        .dom(screen.queryByRole('link', { name: t('pages.certificate.learn-about-certification-results') }))
        .doesNotExist();
    });
  });

  module('when a level is -1', function () {
    test('should not display the level', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const area2 = store.createRecord('area', {
        code: 2,
        id: 'recs7Gpf90ln8NCv7',
        name: 'Deuxième domaine',
        title: 'Domaine 2',
        resultCompetences: [
          store.createRecord('result-competence', {
            index: '2.1',
            name: 'Competence 1 du domaine 2',
            level: -1,
          }),
        ],
      });

      const resultCompetenceTree = store.createRecord('result-competence-tree', {
        areas: [area2],
      });
      const certification = store.createRecord('certification', {
        resultCompetenceTree,
      });
      // when
      const screen = await render(<template><CompetencesDetails @certificate={{certification}} /></template>);

      // then
      const tabpanel = screen.getByRole('tabpanel', { name: '2. Domaine 2' });
      const displayedCompetences = within(tabpanel).getAllByRole('listitem');
      assert.dom(within(displayedCompetences[0]).getByText('2.1 Competence 1 du domaine 2')).exists();
      assert.dom(within(displayedCompetences[0]).getByText('-')).exists();
      assert.dom(within(displayedCompetences[0]).queryByText('-1')).doesNotExist();
    });
  });

  test('should update tabpanel on tab click', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const resultCompetenceTree = _getCompetenceTree(store);
    const certification = store.createRecord('certification', {
      resultCompetenceTree,
    });
    const screen = await render(<template><CompetencesDetails @certificate={{certification}} /></template>);
    const tablist = screen.getByRole('tablist', { name: t('pages.certificate.details.competences.title') });

    // when
    click(within(tablist).getAllByRole('tab')[1]);

    // then
    const tabpanel = await screen.findByRole('tabpanel', { name: /Domaine 2/ });
    assert.dom(within(tabpanel).getByRole('heading', { name: /Domaine 2/ })).exists();
    assert.strictEqual(within(tabpanel).getAllByRole('listitem').length, 1);
    assert
      .dom(within(within(tabpanel).getAllByRole('listitem')[0]).getByText('2.1 Competence 1 du domaine 2'))
      .exists();
    assert.dom(within(within(tabpanel).getAllByRole('listitem')[0]).getByText('niveau')).exists();
    assert.dom(within(within(tabpanel).getAllByRole('listitem')[0]).getByText('4')).exists();
  });

  test('should update tabpanel on keyboard navigation', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const resultCompetenceTree = _getCompetenceTree(store);
    const certification = store.createRecord('certification', {
      resultCompetenceTree,
    });
    const screen = await render(<template><CompetencesDetails @certificate={{certification}} /></template>);
    const tablist = screen.getByRole('tablist', { name: t('pages.certificate.details.competences.title') });

    // when
    await tab();

    // then
    await userEvent.keyboard('[ArrowDown]');
    assert.strictEqual(document.activeElement, within(tablist).getAllByRole('tab')[1]);
    await userEvent.keyboard('[ArrowRight]');
    assert.strictEqual(document.activeElement, within(tablist).getAllByRole('tab')[0]);
    await userEvent.keyboard('[ArrowUp]');
    assert.strictEqual(document.activeElement, within(tablist).getAllByRole('tab')[1]);
    await userEvent.keyboard('[ArrowLeft]');
    assert.strictEqual(document.activeElement, within(tablist).getAllByRole('tab')[0]);
    await userEvent.keyboard('[ArrowUp]');

    await userEvent.keyboard('[Enter]');
    assert.dom(screen.getByRole('tabpanel', { name: /Domaine 2/ })).exists();
  });
});

function _getCompetenceTree(store) {
  const area1 = store.createRecord('area', {
    code: 1,
    id: 'recvoGdo7z2z7pXWa',
    name: '1. Premier domaine',
    title: 'Domaine numéro 1',
    resultCompetences: [
      store.createRecord('result-competence', {
        index: '1.1',
        name: 'Competence 1 du domaine 1',
        level: 3,
      }),
      store.createRecord('result-competence', {
        index: '1.3',
        name: 'Competence 3 du domaine 1',
        level: 1,
      }),
      store.createRecord('result-competence', {
        index: '1.2',
        name: 'Competence 2 du domaine 1',
        level: 6,
      }),
    ],
  });
  const area2 = store.createRecord('area', {
    code: 2,
    id: 'recs7Gpf90ln8NCv7',
    name: '2. Deuxième domaine',
    title: 'Domaine 2',
    resultCompetences: [
      store.createRecord('result-competence', {
        index: '2.1',
        name: 'Competence 1 du domaine 2',
        level: 4,
      }),
    ],
  });

  return store.createRecord('result-competence-tree', {
    areas: [area1, area2],
  });
}
