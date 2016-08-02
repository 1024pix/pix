import '../test-helper';
import { expect } from 'chai';
import { it } from 'ember-mocha';

import describeVisiting from '../helpers/describe-visiting';

describeVisiting('/home', () => {
  visit('/home');

  andThen(() => {
    it('is on /home', () => { expect(currentURL()).to.be('/home'); });
    it('has the correct title', () => {
      expect(find('.title').text().trim()).to.be('Liste des tests');
    });
  });
});
