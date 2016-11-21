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

describe("Acceptance | 06 - Afficher un QCM | ", function () {

  let application;
  let challenge;

  before(function () {
    application = startApp();
  });

  after(function () {
    destroyApp(application);
  });

  before(function () {
    return visit(`/assessments/first_assessment_id/challenges/ref_qcm_challenge_id`);
  });

  it('06.1 It should render challenge instruction', function () {
    // instruction is :
    // Un QCM propose plusieurs choix, lutilisateur peut en choisir plusieurs
    expect($('.challenge-instruction').text()).to.equal('Un QCM propose plusieurs choix, l\'utilisateur peut en choisir plusieurs');
  });

  it("06.2 Le contenu de type [foo](bar) doit être converti sous forme de lien", function() {
    let $links = findWithAssert('.challenge-instruction a');
    expect($links.length).to.equal(1);
    expect($links.text()).to.equal('plusieurs');
    expect($links.attr('href')).to.equal('http://link.plusieurs.url');
  });

  it("06.3 Les liens doivent s'ouvrir dans un nouvel onglet", function() {
    let $links = findWithAssert('.challenge-instruction a');
    expect($links.attr('target')).to.equal('_blank');
  });

  it('06.4 It should render a list of checkboxes', function () {
    const $proposals = $('input[type="checkbox"]');
    expect($proposals).to.have.lengthOf(4);
  });

  it('06.5 It should render an ordered list of instruction', function () {
    const $proposals = $('input[type="checkbox"]');
    expect($('.challenge-proposal:nth-child(1)').text().trim()).to.equal('possibilite 1, et/ou');
    expect($('.challenge-proposal:nth-child(2)').text().trim()).to.equal('possibilite 2, et/ou');
    expect($('.challenge-proposal:nth-child(3)').text().trim()).to.equal('possibilite 3, et/ou');
    expect($('.challenge-proposal:nth-child(4)').text().trim()).to.equal('possibilite 4');
  });

  it('06.7 Error alert box should be hidden by default', function () {
    expect($('.alert')).to.have.lengthOf(0);
  });

  it('06.8 Error alert box should be displayed if user validate without checking a checkbox', function () {
    $('a.challenge-item-actions__validate-action').click();
    andThen(() => {
      expect($('.alert')).to.have.lengthOf(1);
      expect($('.alert').text().trim()).to.equal('Pour valider, sélectionner au moins une réponse. Sinon, passer.');
    });
  });

  it('06.9 By default, no checkboxes are checked', function () {
    expect($('input:checkbox:checked')).to.have.lengthOf(0);
  });

  it('06.10 If an user check a checkbox, it is checked', function () {
    expect($('input:checkbox:checked:nth-child(1)').is(':checked')).to.equal(false);
    $('.challenge-proposal:nth-child(1) input').click();
    andThen(() => {
      expect($('input:checkbox:checked:nth-child(1)').is(':checked')).to.equal(true);
      expect($('input:checkbox:checked')).to.have.lengthOf(1);
    });
  });

  it('06.11 If an user check another radiobutton, it is checked, the previous checked checkboxes remains checked', function () {
    expect($('input:checkbox:checked')).to.have.lengthOf(1);
    click($('.challenge-proposal:nth-child(2) input'));
    andThen(() => {
      expect($('input:checkbox:checked')).to.have.lengthOf(2);
    });
  });
});
