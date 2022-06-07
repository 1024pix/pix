import { visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { module, test } from 'qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { currentURL } from '@ember/test-helpers';

module('Acceptance | Badges | Badge', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When admin member is not logged in', function () {
    test('it should not be accessible by an unauthenticated user', async function (assert) {
      // when
      await visit('/badges/1');

      // then
      assert.strictEqual(currentURL(), '/login');
    });
  });

  module('When admin member is logged in', function () {
    module('when admin member has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function (hooks) {
      hooks.beforeEach(async () => {
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      });

      test('it should be accessible for an authenticated user', async function (assert) {
        // given
        const tube = this.server.create('tube', { practicalTitle: 'Practical title of tube' });
        const skill = this.server.create('skill', { name: '@skill2', difficulty: 2, tube });
        const skillSet = this.server.create('skill-set', {
          id: 1,
          name: 'Internet for dummies',
          color: 'red',
          skills: [skill],
        });

        const criterionCampaignParticipation = this.server.create('badge-criterion', {
          id: 1,
          scope: 'CampaignParticipation',
          threshold: 20,
        });
        const criterionEverySkillSet = this.server.create('badge-criterion', {
          id: 2,
          scope: 'SkillSet',
          threshold: 40,
          skillSets: [skillSet],
        });

        this.server.create('badge', {
          id: 1,
          title: 'My badge',
          imageUrl: 'https://images.pix/fr/badges/AG2R.svg',
          isCertifiable: true,
          isAlwaysVisible: true,
          badgeCriteria: [criterionCampaignParticipation, criterionEverySkillSet],
          skillSets: [skillSet],
        });

        // when
        await visit('/badges/1');

        // then
        assert.strictEqual(currentURL(), '/badges/1');
      });

      test('should display the badge', async function (assert) {
        // given
        const tube = this.server.create('tube', { practicalTitle: 'Practical title of tube' });
        const skill = this.server.create('skill', { name: '@skill2', difficulty: 2, tube });
        const skillSet = this.server.create('skill-set', {
          id: 1,
          name: 'Internet for dummies',
          color: 'red',
          skills: [skill],
        });

        const criterionCampaignParticipation = this.server.create('badge-criterion', {
          id: 1,
          scope: 'CampaignParticipation',
          threshold: 20,
        });
        const criterionEverySkillSet = this.server.create('badge-criterion', {
          id: 2,
          scope: 'SkillSet',
          threshold: 40,
          skillSets: [skillSet],
        });

        const badge = this.server.create('badge', {
          id: 1,
          title: 'My badge',
          imageUrl: 'https://images.pix/fr/badges/AG2R.svg',
          isCertifiable: true,
          isAlwaysVisible: true,
          badgeCriteria: [criterionCampaignParticipation, criterionEverySkillSet],
          skillSets: [skillSet],
        });

        // when
        const screen = await visit(`/badges/${badge.id}`);

        // then
        assert.dom(screen.getByText('Nom du badge : My badge', { exact: false })).exists();
        assert.dom(screen.getByText('20%')).exists();
        assert.dom(screen.getByText('Internet for dummies')).exists();
        assert.dom(screen.getByText('AG2R.svg', { exact: false })).exists();
        assert.dom(screen.getByLabelText('@skill2')).exists();
        assert.dom(screen.getByText('Certifiable')).exists();
        assert.dom(screen.getByText('Lacunes')).exists();
        assert.dom(screen.getByText('Practical title of tube')).exists();
      });

      test('should display only skills from skill-set', async function (assert) {
        // given
        const tube = this.server.create('tube', { practicalTitle: 'Practical title of tube' });
        const skill = this.server.create('skill', { name: '@skill2', difficulty: 2, tube });
        const skillSet = this.server.create('skill-set', {
          id: 1,
          name: 'Internet for dummies',
          color: 'red',
          skills: [skill],
        });

        const criterionCampaignParticipation = this.server.create('badge-criterion', {
          id: 1,
          scope: 'CampaignParticipation',
          threshold: 20,
        });
        const criterionEverySkillSet = this.server.create('badge-criterion', {
          id: 2,
          scope: 'SkillSet',
          threshold: 40,
          skillSets: [skillSet],
        });

        const badge = this.server.create('badge', {
          id: 1,
          title: 'My badge',
          imageUrl: 'https://images.pix/fr/badges/AG2R.svg',
          isCertifiable: true,
          isAlwaysVisible: true,
          badgeCriteria: [criterionCampaignParticipation, criterionEverySkillSet],
          skillSets: [skillSet],
        });

        const skill2 = this.server.create('skill', { name: '@skill3', difficulty: 3, tube });
        const skillSet2 = this.server.create('skill-set', {
          id: 2,
          name: 'Internet for dummies',
          color: 'red',
          skills: [skill2],
        });
        const criterionEverySkillSet2 = this.server.create('badge-criterion', {
          id: 3,
          scope: 'SkillSet',
          threshold: 40,
          skillSets: [skillSet2],
        });
        const badge2 = this.server.create('badge', {
          id: 2,
          title: 'My badge 2',
          imageUrl: 'https://images.pix/fr/badges/AG2R.svg',
          isCertifiable: true,
          isAlwaysVisible: true,
          badgeCriteria: [criterionEverySkillSet2],
          skillSets: [skillSet2],
        });
        await visit(`/badges/${badge2.id}`);

        // when
        const screen = await visit(`/badges/${badge.id}`);

        // then
        assert.dom(screen.queryByLabelText('@skill3')).doesNotExist();
      });
    });

    module('when admin member has role "CERTIF"', function () {
      test('it should be redirect to Organizations page', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isCertif: true })(server);
        server.create('badge', { id: 2 });

        // when
        await visit('/badges/2');

        // then
        assert.strictEqual(currentURL(), '/organizations/list');
      });
    });
  });
});
