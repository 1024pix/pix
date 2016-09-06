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

describe("Acceptance | 14 - Créer une épreuve de type QROC | ", function () {

  let application;
  let challenge;

  before(function () {
    application = startApp();
    challenge = server.create('challenge-airtable', {
      fields: {
        'Consigne': 'Quel est le score du match Stade de Reims - LOSC du championnat de France de football 1954-1955 ?',
        'Propositions': 'Stade de Reims ${reims} - ${LOSC} LOSC (ex : 1-1)',
        "Type d'épreuve": 'QROC'
      }
    });
  });

  after(function () {
    destroyApp(application);
  });

  before(function () {
    return visit(`/challenges/${challenge.attrs.id}/preview`);
  });

  it('14.1 un champ input text est affiché', function () {
    findWithAssert('.challenge-proposals input[type="text"]');
  });
});
