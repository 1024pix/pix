import { describe, it } from 'mocha';
import { expect } from 'chai';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { visit, currentURL, find, findAll } from '@ember/test-helpers';
import { authenticateByEmail } from '../helpers/authentication';

describe('Acceptance | mes-formations', function () {
  setupApplicationTest();
  setupMirage();
  let user;

  describe('When user has recommended trainings', function () {
    it('should display menu item "Mes formations"', async function () {
      // given
      user = server.create('user', 'withEmail', 'withSomeTrainings');

      // when
      await authenticateByEmail(user);
      await visit('/');

      // then
      const menuItem = find('[href="/mes-formations"]');
      expect(menuItem.textContent).to.contain('Mes formations');
    });
  });

  describe('When the user tries to reach /mes-formations', function () {
    it('the user-trainings page is displayed to the user', async function () {
      // given
      user = server.create('user', 'withEmail', 'withSomeTrainings');

      // when
      await authenticateByEmail(user);
      await visit('/mes-formations');

      // then
      expect(currentURL()).to.equal('/mes-formations');
      expect(find('.user-trainings-banner__title')).to.exist;
      expect(find('.user-trainings-banner__title').textContent).to.contain('Mes formations');
      expect(find('.user-trainings-banner__description')).to.exist;
      expect(find('.user-trainings-banner__description').textContent).to.contain(
        'Continuez à progresser grâce aux formations recommandées à l’issue de vos parcours d’évaluation.'
      );
      expect(find('.user-trainings-content__container')).to.exist;
      expect(find('.user-trainings-content-list__item')).to.exist;
      expect(findAll('.user-trainings-content-list__item')).to.be.lengthOf(2);
      expect(find('.pix-pagination__navigation')).to.exist;
    });
  });
});
