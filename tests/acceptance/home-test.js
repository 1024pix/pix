import '../test-helper';
import { expect } from 'chai';
import {
  describe,
  it,
  beforeEach,
  afterEach
} from 'mocha';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance | /home', function () {

  beforeEach(function () {
    this.application = startApp();
  });

  afterEach(function () {
    return destroyApp(this.application);
  });

  it('should display the title', function () {
    visit('/home');

    andThen(function () {
      expect(currentURL()).to.be.eq('/home');
      expect(find('.title').text()).to.contains('Liste des tests');
    });
  });
});
