import { render as renderScreen } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { certificationIssueReportSubcategories } from 'pix-admin/models/certification-issue-report';
import { module, test } from 'qunit';

module('Integration | Component | certifications/issue-report', function (hooks) {
  setupRenderingTest(hooks);

  test('it should display issue details', async function (assert) {
    // Given
    const store = this.owner.lookup('service:store');
    const issueReport = store.createRecord('certification-issue-report', {
      category: 'TECHNICAL_PROBLEM',
      subcategory: 'FILE_NOT_OPENING',
      description: 'this is a report',
      questionNumber: 2,
      isImpactful: true,
      resolvedAt: null,
    });
    this.set('issueReport', issueReport);
    class AccessControlStub extends Service {
      hasAccessToCertificationActionsScope = true;
    }
    this.owner.register('service:access-control', AccessControlStub);

    // When
    const screen = await renderScreen(hbs`<Certifications::IssueReport @issueReport={{this.issueReport}} />`);

    // Then
    assert
      .dom(
        screen.getByText(
          "Problème technique non bloquant : Le fichier à télécharger ne se télécharge pas ou ne s'ouvre pas - this is a report - Question 2",
        ),
      )
      .exists();
  });

  module('when the issue has not been resolved yet', function () {
    module('when current user has access to certification actions scope', function () {
      test('it should display resolve button', async function (assert) {
        // Given
        const store = this.owner.lookup('service:store');
        const issueReport = store.createRecord('certification-issue-report', { isImpactful: true, resolvedAt: null });
        this.set('issueReport', issueReport);
        class AccessControlStub extends Service {
          hasAccessToCertificationActionsScope = true;
        }
        this.owner.register('service:access-control', AccessControlStub);

        // When
        const screen = await renderScreen(hbs`<Certifications::IssueReport @issueReport={{this.issueReport}} />`);

        // Then
        assert.dom(screen.getByRole('button', { name: 'Résoudre le signalement' })).exists();
      });
    });

    module('when current user does not have access to certification actions scope', function () {
      test('it should not display resolve button', async function (assert) {
        // Given
        const store = this.owner.lookup('service:store');
        const issueReport = store.createRecord('certification-issue-report', { isImpactful: true, resolvedAt: null });
        this.set('issueReport', issueReport);

        class AccessControlStub extends Service {
          hasAccessToCertificationActionsScope = false;
        }
        this.owner.register('service:access-control', AccessControlStub);

        // When
        const screen = await renderScreen(hbs`<Certifications::IssueReport @issueReport={{this.issueReport}} />`);

        // Then
        assert.dom(screen.queryByRole('button', { name: 'Résoudre le signalement' })).doesNotExist();
      });
    });
  });

  module('when the issue has already been resolved', function () {
    test('it should not display resolve button', async function (assert) {
      // Given
      const store = this.owner.lookup('service:store');
      const issueReport = store.createRecord('certification-issue-report', {
        isImpactful: true,
        resolvedAt: new Date('2020-01-01'),
      });
      this.set('issueReport', issueReport);
      class AccessControlStub extends Service {
        hasAccessToCertificationActionsScope = true;
      }
      this.owner.register('service:access-control', AccessControlStub);

      // When
      const screen = await renderScreen(hbs`<Certifications::IssueReport @issueReport={{this.issueReport}} />`);

      // Then
      assert.dom(screen.queryByRole('button', { name: 'Résoudre le signalement' })).doesNotExist();
    });

    module('when the issue has been resolved manually', function () {
      test('it should display enabled resolution modification button', async function (assert) {
        // Given
        const store = this.owner.lookup('service:store');
        const issueReport = store.createRecord('certification-issue-report', {
          isImpactful: true,
          resolvedAt: new Date('2020-01-01'),
          hasBeenAutomaticallyResolved: false,
        });
        this.set('issueReport', issueReport);

        class AccessControlStub extends Service {
          hasAccessToCertificationActionsScope = true;
        }

        this.owner.register('service:access-control', AccessControlStub);

        // When
        const screen = await renderScreen(hbs`<Certifications::IssueReport @issueReport={{this.issueReport}} />`);

        // Then

        assert.dom(screen.getByRole('button', 'Modifier la résolution')).isEnabled();
      });
    });

    module('when the issue has been resolved automatically', function () {
      test('it should not display resolution modification button', async function (assert) {
        // Given
        const store = this.owner.lookup('service:store');
        const issueReport = store.createRecord('certification-issue-report', {
          isImpactful: true,
          resolvedAt: new Date('2020-01-01'),
          hasBeenAutomaticallyResolved: true,
        });
        this.set('issueReport', issueReport);

        class AccessControlStub extends Service {
          hasAccessToCertificationActionsScope = true;
        }

        this.owner.register('service:access-control', AccessControlStub);

        // When
        const screen = await renderScreen(hbs`<Certifications::IssueReport @issueReport={{this.issueReport}} />`);

        // Then
        assert.dom(screen.queryByRole('button', { name: 'Modifier la résolution' })).doesNotExist();
      });
    });
  });

  [
    {
      subcategory: certificationIssueReportSubcategories.NAME_OR_BIRTHDATE,
      expectedLabel: 'Modification des prénom/nom/date de naissance',
    },
    {
      subcategory: certificationIssueReportSubcategories.EXTRA_TIME_PERCENTAGE,
      expectedLabel: 'Ajout/modification du temps majoré',
    },
    { subcategory: certificationIssueReportSubcategories.LEFT_EXAM_ROOM, expectedLabel: 'Écran de fin de test non vu' },
    {
      subcategory: certificationIssueReportSubcategories.SIGNATURE_ISSUE,
      expectedLabel: 'Était présent(e) mais a oublié de signer, ou a signé sur la mauvaise ligne',
    },
    {
      subcategory: certificationIssueReportSubcategories.IMAGE_NOT_DISPLAYING,
      expectedLabel: "L'image ne s'affiche pas",
    },
    {
      subcategory: certificationIssueReportSubcategories.EMBED_NOT_WORKING,
      expectedLabel: "Le simulateur/l'application ne s'affiche pas",
    },
    {
      subcategory: certificationIssueReportSubcategories.FILE_NOT_OPENING,
      expectedLabel: "Le fichier à télécharger ne se télécharge pas ou ne s'ouvre pas",
    },
    {
      subcategory: certificationIssueReportSubcategories.WEBSITE_UNAVAILABLE,
      expectedLabel: 'Le site à visiter est indisponible/en maintenance/inaccessible',
    },
    {
      subcategory: certificationIssueReportSubcategories.WEBSITE_BLOCKED,
      expectedLabel: "Le site est bloqué par les restrictions réseau de l'établissement (réseaux sociaux par ex.)",
    },
    { subcategory: certificationIssueReportSubcategories.LINK_NOT_WORKING, expectedLabel: 'Le lien ne fonctionne pas' },
    { subcategory: certificationIssueReportSubcategories.OTHER, expectedLabel: 'Autre incident lié à une question' },
    {
      subcategory: certificationIssueReportSubcategories.EXTRA_TIME_EXCEEDED,
      expectedLabel:
        "Le candidat bénéficie d'un temps majoré et n'a pas pu répondre à la question dans le temps imparti",
    },
    {
      subcategory: certificationIssueReportSubcategories.SOFTWARE_NOT_WORKING,
      expectedLabel: "Le logiciel installé sur l'ordinateur n'a pas fonctionné",
    },
    {
      subcategory: certificationIssueReportSubcategories.UNINTENTIONAL_FOCUS_OUT,
      expectedLabel:
        'Le candidat a été contraint de cliquer en dehors du cadre autorisé pour une question en mode focus',
    },
    {
      subcategory: certificationIssueReportSubcategories.SKIP_ON_OOPS,
      expectedLabel:
        'Une page «Oups une erreur est survenue» ou tout autre problème technique lié à la plateforme a empêché le candidat de répondre à la question',
    },
    {
      subcategory: certificationIssueReportSubcategories.ACCESSIBILITY_ISSUE,
      expectedLabel: 'Problème avec l’accessibilité de la question (ex : daltonisme)',
    },
  ].forEach(function ({ subcategory, expectedLabel }) {
    test('should display subcategory', async function (assert) {
      // given
      class AccessControlStub extends Service {
        hasAccessToCertificationActionsScope = true;
      }
      this.owner.register('service:access-control', AccessControlStub);
      const store = this.owner.lookup('service:store');
      const issueReport = store.createRecord('certification-issue-report', {
        category: 'TECHNICAL_PROBLEM',
        subcategory,
        description: 'this is a report',
        questionNumber: 2,
        isImpactful: true,
        resolvedAt: null,
      });
      this.set('issueReport', issueReport);

      // when
      const screen = await renderScreen(hbs`<Certifications::IssueReport @issueReport={{this.issueReport}} />`);

      // then
      assert.dom(screen.getByText(expectedLabel, { exact: false })).exists();
    });
  });
});
