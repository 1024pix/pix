import {
  describe,
  it,
  beforeEach,
  afterEach
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import $ from 'jquery';

function visitTimedChallenge() {
  visit('/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id');
  click('.challenge-item-warning button');
}

describe('Acceptance | Displaying a QCM', function() {

  let application;

  beforeEach(function() {
    application = startApp();
    visitTimedChallenge();
  });

  afterEach(function() {
    destroyApp(application);
  });

  it('should render challenge instruction', function() {
    // Given
    const expectedInstruction = 'Un QCM propose plusieurs choix, l\'utilisateur peut en choisir plusieurs';

    // When
    const $challengeInstruction = $('.challenge-statement__instruction');

    // Then
    expect($challengeInstruction.text().trim()).to.equal(expectedInstruction);
  });

  it('should format content written as [foo](bar) as clickable link', function() {
    // When
    const $links = findWithAssert('.challenge-statement__instruction a');

    // Then
    expect($links.length).to.equal(1);
    expect($links.text()).to.equal('plusieurs');
    expect($links.attr('href')).to.equal('http://link.plusieurs.url');
  });

  it('should open the links in a new tab', function() {
    const $links = findWithAssert('.challenge-statement__instruction a');
    expect($links.attr('target')).to.equal('_blank');
  });

  it('should render a list of checkboxes', function() {
    const $proposals = $('input[type="checkbox"]');
    expect($proposals).to.have.lengthOf(4);
  });

  it('should mark checkboxes that have been checked', function() {
    expect($('input:checkbox:checked')).to.have.lengthOf(2);
  });

  it('should render an ordered list of instruction', function() {
    expect($('.proposal-text:eq(0)').text().trim()).to.equal('possibilite 1, et/ou');
    expect($('.proposal-text:eq(1)').text().trim()).to.equal('possibilite 2, et/ou');
    expect($('.proposal-text:eq(2)').text().trim()).to.equal('possibilite 3, et/ou');
    expect($('.proposal-text:eq(3)').text().trim()).to.equal('possibilite 4');
  });

  it('should hide the error alert box by default', function() {
    expect($('.alert')).to.have.lengthOf(0);
  });

  it('should display the alert box if user validates without checking a checkbox', function() {
    // Given
    const $validateLink = $('.challenge-actions__action-validate');
    expect($('input:checkbox:checked')).to.have.lengthOf(2);

    //
    $('input:checkbox').prop('checked', false);
    expect($('input:checkbox:checked')).to.have.lengthOf(0);

    // When
    click($validateLink);

    // Then
    andThen(() => {
      expect($('.alert')).to.have.lengthOf(1);
      expect($('.alert').text().trim()).to.equal('Pour valider, sélectionner au moins une réponse. Sinon, passer.');
    });
  });

  it('should set the checkbox state as checked when user checks a checkbox', function() {
    $('input:checkbox').prop('checked', false);
    $('.proposal-text:eq(1)').click();
    andThen(() => {
      expect($('input:checkbox:checked')).to.have.lengthOf(1);
    });
  });

  it('should not alter a checkbox state when siblings checkboxes are checked', function() {
    $('input:checkbox').prop('checked', false);
    $('input:checkbox:eq(1)').prop('checked', true);
    expect($('input:checkbox:checked')).to.have.lengthOf(1);
    $('.proposal-text:eq(2)').click();
    andThen(() => {
      expect($('input:checkbox:checked')).to.have.lengthOf(2);
    });
  });

  it('should only display the error alert checkbox after the user has tried to at least interact with checkboxes', async function() {
    // given
    $('input:checkbox').prop('checked', false);
    await click('.challenge-actions__action-validate');

    // when
    await click($('.proposal-text:eq(1)'));

    // then
    const $alert = $('.alert');
    expect($alert).to.have.lengthOf(0);
  });

});
