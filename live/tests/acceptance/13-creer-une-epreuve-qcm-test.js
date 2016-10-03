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
import RSVP from 'rsvp';

describe("Acceptance | 13 - Créer une épreuve de type QCM | ", function () {

  let application;
  let challenge;

  before(function () {
    application = startApp();
    challenge = server.create('challenge-airtable', {
      fields: {
        'Consigne': 'Quel sont les meilleurs jours de la semaine ?',
        'Propositions': '- lundi\n - mardi\n- samedi\n- jeudi\n- dimanche',
        "Type d'épreuve": 'QCM'
      }
    });
  });

  after(function () {
    destroyApp(application);
  });

  before(function () {
    return visit(`/challenges/${challenge.attrs.id}/preview`);
  });

  it('14.1 les propositions checkbox sont affichées', function () {
    const $proposals = findWithAssert('.challenge-proposals input[type="checkbox"]');
    expect($proposals).to.have.lengthOf(5);
  });
});
