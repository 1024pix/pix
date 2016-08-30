import {
  describe,
  it,
  before,
  beforeEach,
  after
} from 'mocha';
import {expect} from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import RSVP from 'rsvp';

describe("Acceptance | 25 - Afficher une image sous la consigne | ", function () {
  let application;
  let challenge;

  before(function () {
    application = startApp();
    challenge = {
      id: 'test_id_FIXME_remove_it'
    }

  });

  after(function () {
    destroyApp(application);
  });

  before(function () {
    return visit(`/challenges/${challenge.id}/preview`);
  });

  it('25.1 Une image unique peut être affichée sous la consigne', function () {

  });

  it('25.2 Cette image a un alt text “ceci est une image”', function () {
    expect(findWithAssert('.challenge-statement img').attr('alt')).to.contains('ceci est une image');
  });
});
