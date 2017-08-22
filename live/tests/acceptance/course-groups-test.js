import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import { startApp, destroyApp } from '../helpers/application';

describe('Acceptance | courseGroups', function() {

  let application;

  beforeEach(function() {
    application = startApp();
  });

  afterEach(function() {
    destroyApp(application);
  });

  describe('Access to the page', function() {

    it('should display the historic of the weekly courses courseGroups by the url /defis-pix', async function() {
      // when
      await visit('/defis-pix');

      // then
      expect(currentURL()).to.equal('/defis-pix');
    });

  });

  describe('Rendering', function() {

    it('should display a navbar and a footer', async function() {
      // when
      await visit('/defis-pix');

      // then
      expect(find('.navbar-header')).to.have.lengthOf(1);
      expect(find('.app-footer')).to.have.lengthOf(1);
    });

    it('should display a header section', async function() {
      // when
      await visit('/defis-pix');

      // then
      expect(find('.course-groups-page__header')).to.have.lengthOf(1);
    });

    it('should display a list of (weekly courses) course-groups', async function() {
      // given
      const courses = server.createList('course', 2, { name: 'course name' });
      server.createList('courseGroup', 3, { courses });

      // when
      await visit('/defis-pix');

      // then
      expect(find('.course-item__name')[0].innerText).to.equal('course name');

      expect(find('.course-groups-page__course-groups')).to.have.lengthOf(1);
      expect(find('.course-groups-page__course-group-item')).to.have.lengthOf(3);
      expect(find('.course-list')).to.have.lengthOf(3);
      expect(find('.course-item')).to.have.lengthOf(6);
    });

  });
});
