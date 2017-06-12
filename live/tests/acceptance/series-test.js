import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import startApp from 'pix-live/tests/helpers/start-app';
import destroyApp from 'pix-live/tests/helpers/destroy-app';

describe.only('Acceptance | series', function() {

  let application;

  beforeEach(function() {
    application = startApp();
  });

  afterEach(function() {
    destroyApp(application);
  });

  describe('Accessibility', function() {

    it('I can access to the historic of the weekly courses series by the url /defis-pix', async function() {
      // when
      await visit('/defis-pix');

      // then
      expect(currentURL()).to.equal('/defis-pix');
    });

  });

  describe('Rendering', function() {

    it('should display a navbar', async function() {
      // when
      await visit('/defis-pix');

      // then
      expect(find('.navbar-header')).to.have.lengthOf(1);
    });

    it('should display a header section', async function() {
      // when
      await visit('/defis-pix');

      // then
      expect(find('.series-page__header')).to.have.lengthOf(1);
    });

    it('should display a list of (weekly courses) series', async function() {
      // given
      const courses = server.createList('course', 2, {name: 'course name'});
      server.createList('courseGroup', 3, {courses});

      // when
      await visit('/defis-pix');

      // then
      expect(find('.course-item__name')[0].innerText).to.equal('course name');

      expect(find('.series-page__series')).to.have.lengthOf(1);
      expect(find('.series-page__serie-item')).to.have.lengthOf(3);
      expect(find('.course-list')).to.have.lengthOf(3);
      expect(find('.course-item')).to.have.lengthOf(6);
    });

    //Futur tests eventuels
    //it('should launch a test if the user click on "DEMARRER"', function() {});
  });
});
