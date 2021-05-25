import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';

module('Integration | Component | routes/authenticated/certifications/certification | informations', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    const user = server.create('user');
    await createAuthenticateSession({ userId: user.id });
  });

  module('When certification is not cancelled', () => {

    test('the certification cancellation button is not disabled ', async function(assert) {
      // given
      const certification = this.server.create('certification', {
        status: 'started',
        competencesWithMark: [],
      });

      const cancellationButtonSelector = '.buttons-row .pix-button';

      // when
      await visit(`/certifications/${certification.id}`);

      // then
      assert.dom(cancellationButtonSelector).doesNotHaveAttribute('disabled');
    });
  });

  module('When certification is cancelled', () => {

    test('the certification cancellation button is disabled ', async function(assert) {
      // given
      const certification = this.server.create('certification', {
        status: 'cancelled',
        competencesWithMark: [],
      });

      const cancellationButtonSelector = '.buttons-row .pix-button';

      // when
      await visit(`/certifications/${certification.id}`);

      // then
      assert.dom(cancellationButtonSelector).hasAttribute('disabled');
    });
  });

  module('certification issue report container', function() {

    module('when there is no certification issue report', function() {
      test('it renders nothing', async function(assert) {
        // given
        const certificationIssueReports = [];
        const certification = this.server.create('certification', {
          certificationIssueReports,
          competencesWithMark: [
            {
              'id': 104637,
              'area_code': '5',
              'competence_code': '5.1',
              'competenceId': 'recIhdrmCuEmCDAzj',
              'level': -1,
              'score': 0,
              'assessmentResultId': 104635,
            },
            {
              'id': 104650,
              'area_code': '1',
              'competence_code': '1.3',
              'competenceId': 'recIkYm646lrGvLNT',
              'level': -1,
              'score': 0,
              'assessmentResultId': 104635,
            },
          ],
        });

        // when
        await visit(`/certifications/${certification.id}`);

        // then
        assert.notContains('Signalements');
      });
    });

    module('when there are certification issue reports', function() {

      module('when there are only impactful certification issue reports', function() {

        test('it renders only impactful certifications issue reports', async function(assert) {
          // given
          const certificationIssueReport = this.server.create('certification-issue-report', {
            category: 'OTHER',
            description: 'Un signalement impactant',
            isImpactful: true,
          });
          const certification = this.server.create('certification', {
            competencesWithMark: [
              {
                'id': 104637,
                'area_code': '5',
                'competence_code': '5.1',
                'competenceId': 'recIhdrmCuEmCDAzj',
                'level': -1,
                'score': 0,
                'assessmentResultId': 104635,
              },
              {
                'id': 104650,
                'area_code': '1',
                'competence_code': '1.3',
                'competenceId': 'recIkYm646lrGvLNT',
                'level': -1,
                'score': 0,
                'assessmentResultId': 104635,
              },
            ],
          });
          certification.update({ certificationIssueReports: [certificationIssueReport] });

          // when
          await visit(`/certifications/${certification.id}`);

          // then
          assert.contains('Signalement(s) impactant(s)');
          assert.dom('.card-text ul li').hasText('Autre (si aucune des catégories ci-dessus ne correspond au signalement) - Un signalement impactant');
          assert.notContains('Signalement(s) non impactant(s)');
        });

        module('when the impactful certification issue report is resolved', function() {

          test('it renders the certifications issue report with the resolved icon', async function(assert) {
            // given
            const resolvedCertificationIssueReport = this.server.create('certification-issue-report', {
              category: 'OTHER',
              description: 'Un signalement impactant',
              isImpactful: true,
              resolvedAt: Date.now(),
            });
            const certification = this.server.create('certification', {
              competencesWithMark: [],
              certificationIssueReports: [resolvedCertificationIssueReport],
            });

            // when
            await visit(`/certifications/${certification.id}`);

            // then
            assert.dom('.certification-informations__certification-issue-report--resolved').exists();
            assert.dom('.certification-informations__certification-issue-report--unresolved').doesNotExist();
          });
        });

        module('when the impactful certification issue report is not resolved', function() {

          test('it renders the certifications issue report with the unresolved icon', async function(assert) {
            // given
            const unresolvedCertificationIssueReport = this.server.create('certification-issue-report', {
              category: 'OTHER',
              description: 'Un signalement impactant',
              isImpactful: true,
              resolvedAt: null,
            });
            const certification = this.server.create('certification', {
              competencesWithMark: [],
              certificationIssueReports: [unresolvedCertificationIssueReport],
            });

            // when
            await visit(`/certifications/${certification.id}`);

            // then
            assert.dom('.certification-informations__certification-issue-report--unresolved').exists();
            assert.dom('.certification-informations__certification-issue-report--resolved').doesNotExist();
          });
        });
      });

      module('when there are only unimpactful certification issue reports', function() {

        test('it renders only unimpactful certifications issue reports', async function(assert) {
          // given
          const certificationIssueReport = this.server.create('certification-issue-report', {
            category: 'CANDIDATE_INFORMATIONS_CHANGES',
            subcategory: 'EXTRA_TIME_PERCENTAGE',
            description: 'Un signalement non impactant',
            isImpactful: false,
          });
          const certification = this.server.create('certification', {
            competencesWithMark: [
              {
                'id': 104637,
                'area_code': '5',
                'competence_code': '5.1',
                'competenceId': 'recIhdrmCuEmCDAzj',
                'level': -1,
                'score': 0,
                'assessmentResultId': 104635,
              },
              {
                'id': 104650,
                'area_code': '1',
                'competence_code': '1.3',
                'competenceId': 'recIkYm646lrGvLNT',
                'level': -1,
                'score': 0,
                'assessmentResultId': 104635,
              },
            ],
          });
          certification.update({ certificationIssueReports: [certificationIssueReport] });

          // when
          await visit(`/certifications/${certification.id}`);

          // then
          assert.contains('Signalement(s) non impactant(s)');
          assert.dom('.card-text ul li').hasText('Modification infos candidat : Ajout/modification du temps majoré - Un signalement non impactant');
          assert.notContains('Signalement(s) impactant(s)');
        });
      });

      test('it renders a "in challenge" issue report with its challenge number', async function(assert) {
        // given
        const certificationIssueReport = this.server.create('certification-issue-report', {
          category: 'IN_CHALLENGE',
          subcategory: 'IMAGE_NOT_DISPLAYING',
          description: 'image disparue',
          questionNumber: 666,
          isImpactful: true,
        });
        const certification = this.server.create('certification', {
          competencesWithMark: [
            {
              'id': 104637,
              'area_code': '5',
              'competence_code': '5.1',
              'competenceId': 'recIhdrmCuEmCDAzj',
              'level': -1,
              'score': 0,
              'assessmentResultId': 104635,
            },
            {
              'id': 104650,
              'area_code': '1',
              'competence_code': '1.3',
              'competenceId': 'recIkYm646lrGvLNT',
              'level': -1,
              'score': 0,
              'assessmentResultId': 104635,
            },
          ],
        });
        certification.update({ certificationIssueReports: [certificationIssueReport] });

        // when
        await visit(`/certifications/${certification.id}`);

        // then
        assert.dom('.card-text ul li').hasText('Problème technique sur une question : L\'image ne s\'affiche pas - image disparue - Question 666');
      });

    });

  });
});
