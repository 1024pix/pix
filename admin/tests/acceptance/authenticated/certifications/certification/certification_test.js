import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit } from '@1024pix/ember-testing-library';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateAdminMemberWithRole } from '../../../../helpers/test-init';

module('Acceptance | Route | routes/authenticated/certifications/certification', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('when certification is V3', function () {
    test('it should not display the profile tab', async function (assert) {
      // given
      this.server.create('user', { id: 888 });

      const certification = this.server.create('certification', {
        id: 123,
        firstName: 'Bora Horza',
        lastName: 'Gobuchul',
        birthdate: '1987-07-24',
        birthplace: 'Sorpen',
        userId: 888,
        sex: 'M',
        isCancelled: false,
        birthCountry: 'JAPON',
        birthInseeCode: '99217',
        birthPostalCode: null,
        competencesWithMark: [],
        listChallengesAndAnswers: [],
        createdAt: new Date('2020-01-01'),
        version: 3,
      });

      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

      // when
      const screen = await visit(`/certifications/${certification.id}`);

      // then
      assert.dom(screen.queryByRole('link', { name: 'Profil' })).doesNotExist();
    });

    test('it should not display the neutralization tab', async function (assert) {
      // given
      this.server.create('user', { id: 888 });

      const certification = this.server.create('certification', {
        id: 123,
        firstName: 'Bora Horza',
        lastName: 'Gobuchul',
        birthdate: '1987-07-24',
        birthplace: 'Sorpen',
        userId: 888,
        sex: 'M',
        isCancelled: false,
        birthCountry: 'JAPON',
        birthInseeCode: '99217',
        birthPostalCode: null,
        competencesWithMark: [],
        listChallengesAndAnswers: [],
        createdAt: new Date('2020-01-01'),
        version: 3,
      });

      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

      // when
      const screen = await visit(`/certifications/${certification.id}`);

      // then
      assert.dom(screen.queryByRole('link', { name: 'Neutralisation' })).doesNotExist();
    });
  });

  module('when certification is V2', function () {
    test('it should display the profile tab', async function (assert) {
      // given
      this.server.create('user', { id: 888 });

      const certification = this.server.create('certification', {
        id: 123,
        firstName: 'Bora Horza',
        lastName: 'Gobuchul',
        birthdate: '1987-07-24',
        birthplace: 'Sorpen',
        userId: 888,
        sex: 'M',
        isCancelled: false,
        birthCountry: 'JAPON',
        birthInseeCode: '99217',
        birthPostalCode: null,
        competencesWithMark: [],
        listChallengesAndAnswers: [],
        createdAt: new Date('2020-01-01'),
        version: 2,
      });

      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

      // when
      const screen = await visit(`/certifications/${certification.id}`);

      // then
      assert.dom(screen.getByRole('link', { name: 'Profil' })).exists();
    });

    test('it should display the neutralization tab', async function (assert) {
      // given
      this.server.create('user', { id: 888 });

      const certification = this.server.create('certification', {
        id: 123,
        firstName: 'Bora Horza',
        lastName: 'Gobuchul',
        birthdate: '1987-07-24',
        birthplace: 'Sorpen',
        userId: 888,
        sex: 'M',
        isCancelled: false,
        birthCountry: 'JAPON',
        birthInseeCode: '99217',
        birthPostalCode: null,
        competencesWithMark: [],
        listChallengesAndAnswers: [],
        createdAt: new Date('2020-01-01'),
        version: 2,
      });

      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

      // when
      const screen = await visit(`/certifications/${certification.id}`);

      // then
      assert.dom(screen.getByRole('link', { name: 'Neutralisation' })).exists();
    });
  });
});
