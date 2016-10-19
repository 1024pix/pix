import {
  describe,
  it,
  before,
  beforeEach,
  after
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe("Acceptance | 25 - Afficher une image sous la consigne | ", function () {
  let application;
  let challenge;

  before(function () {
    application = startApp();
  });

  after(function () {
    destroyApp(application);
  });

  describe("Quand l'épreuve contient une illustration en consigne", function () {

    before(function () {
      return visit('/challenges/qcu_challenge_with_image_id/preview');
    });

    it('25.1 Une image unique peut être affichée sous la consigne', function () {
      const $illustration = findWithAssert('.challenge-illustration > img');
      expect($illustration.length).to.equal(1);
    });

    it('25.2 Cette image a un alt text “ceci est une image”', function () {
      const $illustration = findWithAssert('.challenge-illustration > img');
      expect($illustration.attr('alt')).to.contains('ceci est une image');
    });
  });

  describe("Quand l'épreuve ne contient pas d'illustration en consigne", function () {

    before(function () {
      return visit('/challenges/qcu_challenge_without_image_id/preview');
    });

    it("25.3 La section d'illustration est cachée", function () {
      const $attachmentLink = $('.challenge-illustration');
      expect($attachmentLink.length).to.equal(0);
    });
  });
});
