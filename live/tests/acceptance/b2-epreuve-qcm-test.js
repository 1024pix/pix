import {
  describe,
  it,
  before,
  after
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance | b2 - Afficher un QCM | ', function () {

  let application;

  before(function () {
    application = startApp();
  });

  after(function () {
    destroyApp(application);
  });

  before(function () {
    return visit('/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id');
  });

  it('b2.1 It should render challenge instruction', function () {
    // instruction is :
    // Un QCM propose plusieurs choix, lutilisateur peut en choisir plusieurs
    expect($('.challenge-instruction').text()).to.equal('Un QCM propose plusieurs choix, l\'utilisateur peut en choisir plusieurs');
  });

  it('b2.2 Le contenu de type [foo](bar) doit être converti sous forme de lien', function() {
    const $links = findWithAssert('.challenge-instruction a');
    expect($links.length).to.equal(1);
    expect($links.text()).to.equal('plusieurs');
    expect($links.attr('href')).to.equal('http://link.plusieurs.url');
  });

  it('b2.3 Les liens doivent s\'ouvrir dans un nouvel onglet', function() {
    const $links = findWithAssert('.challenge-instruction a');
    expect($links.attr('target')).to.equal('_blank');
  });

  it('b2.4 It should render a list of checkboxes', function () {
    const $proposals = $('input[type="checkbox"]');
    expect($proposals).to.have.lengthOf(4);
  });

  it('b2.5 By default, already checked checkboxes are checked', function () {
    expect($('input:checkbox:checked')).to.have.lengthOf(3);
  });

  it('b2.6 It should render an ordered list of instruction', function () {
    expect($('.challenge-proposal:nth-child(1)').text().trim()).to.equal('possibilite 1, et/ou');
    expect($('.challenge-proposal:nth-child(2)').text().trim()).to.equal('possibilite 2, et/ou');
    expect($('.challenge-proposal:nth-child(3)').text().trim()).to.equal('possibilite 3, et/ou');
    expect($('.challenge-proposal:nth-child(4)').text().trim()).to.equal('possibilite 4');
  });

  it('b2.7 Error alert box should be hidden by default', function () {
    expect($('.alert')).to.have.lengthOf(0);
  });

  it('b2.8 Error alert box should be displayed if user validate without checking a checkbox', function () {
    expect($('input:checkbox:checked')).to.have.lengthOf(3);
    $('input:checkbox').prop('checked', false);
    expect($('input:checkbox:checked')).to.have.lengthOf(0);
    click($('a.challenge-item-actions__validate-action'));
    andThen(() => {
      expect($('.alert')).to.have.lengthOf(1);
      expect($('.alert').text().trim()).to.equal('Pour valider, sélectionner au moins une réponse. Sinon, passer.');
    });
  });


  it('b2.10 If an user check a checkbox, it is checked', function () {
    expect($('input:checkbox:checked:nth-child(1)').is(':checked')).to.equal(false);
    $('.challenge-proposal:nth-child(1) input').click();
    andThen(() => {
      expect($('input:checkbox:checked:nth-child(1)').is(':checked')).to.equal(true);
      expect($('input:checkbox:checked')).to.have.lengthOf(1);
    });
  });

  it('b2.11 If an user check another checkbox, it is checked, the previous checked checkboxes remains checked', function () {
    expect($('input:checkbox:checked')).to.have.lengthOf(1);
    click($('.challenge-proposal:nth-child(2) input'));
    andThen(() => {
      expect($('input:checkbox:checked')).to.have.lengthOf(2);
    });
  });
});
