import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

const CHALLENGE_WITHOUT_INTERNET_NOR_TOOLS_URI = '/assessments/ref_assessment_id/challenges/ref_qcu_challenge_id';
const CHALLENGE_ALLOWING_INTERNET_OR_TOOS_URI = '/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id';

describe('Acceptance | g1 - Afficahge du bandeau indiquant que l\'usage d\'Internet ou d\'outils est interdit | ', function () {

  let application;

  beforeEach(function () {
    application = startApp();
  });

  afterEach(function () {
    destroyApp(application);
  });

  it('g1.1 le bandeau doit être affiché si l\'usage d\'Internet ou d\'outils est interdit dans le cadre de l\'épreuve', async function () {
    await visit(CHALLENGE_WITHOUT_INTERNET_NOR_TOOLS_URI);
    expect($('.challenge-stay__text').text()).to.contains('Vous devez répondre à cette question sans sortir de cette page !');
  });

  it('g1.2 le bandeau ne doit pas être affiché si l\'usage d\'Internet ou d\'outils est autorisé dans le cadre de l\'épreuve', function () {
    visit(CHALLENGE_ALLOWING_INTERNET_OR_TOOS_URI);
    expect($('.challenge-stay__text')).to.have.lengthOf(0);
  });

});
