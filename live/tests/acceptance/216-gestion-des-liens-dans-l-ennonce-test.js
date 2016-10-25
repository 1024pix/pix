import {
  describe,
  it,
  before,
  after
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe("Acceptance | 216 - Gestion des liens dans l'énoncé d'une épreuve |", function () {

  let application;
  let $links;

  before(function () {
    application = startApp();
  });

  after(function () {
    destroyApp(application);
  });

  before(function (done) {
    visit('/challenges/qcu_challenge_id_with_links_in_instruction/preview');
    andThen(() => {
      $links = findWithAssert('.challenge-instruction a');
      done();
    });
  });

  it("Le contenu de type [foo](bar) doit être converti sous forme de lien", function() {
    expect($links.length).to.equal(3);
  });

  it("Les liens doivent s'ouvrir dans un nouvel onglet", function() {
    for (let i = 0 ; i < $links.length ; i++) {
      expect($links[i].getAttribute('target')).to.equal('_blank');
    }
  });

});
