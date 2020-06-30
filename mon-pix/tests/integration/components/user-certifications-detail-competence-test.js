import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject from '@ember/object';
import { find, findAll, render } from '@ember/test-helpers';
import { A as EmberArray } from '@ember/array';

describe('Integration | Component | user-certifications-detail-competence', function() {
  setupRenderingTest();

  let area;
  const PARENT_SELECTOR = '.user-certifications-detail-competence';
  const TITLE_SELECTOR = `${PARENT_SELECTOR}__title`;
  const COMPETENCE_SELECTOR = `${PARENT_SELECTOR} div`;
  const DISABLED_CLASS = 'user-certifications-detail-competence__competence--disabled';

  beforeEach(async function() {
    area = EmberObject.create({
      code: 3,
      id: 'recs7Gpf90ln8NCv7',
      name: '3. Création de contenu',
      title: 'Création de contenu',
      resultCompetences: EmberArray([
        {
          'index': 1.1,
          'level': 5,
          'name': 'Programmer',
          'score': 41,
        },
        {
          'index': 1.2,
          'level': -1,
          'name': 'Adapter les docs à leur finalité',
          'score': 0,
        },
        {
          'index': 1.3,
          'level': 0,
          'name': 'Développer des docs multimédia',
          'score': 0,
        },
        {
          'index': 1.4,
          'level': 3,
          'name': 'Développer des docs textuels',
          'score': 20,
        },
      ]),
    });
    this.set('area', area);

    // when
    await render(hbs`<UserCertificationsDetailCompetence @area={{this.area}} />`);
  });

  it('renders', function() {
    //then
    expect(find(`${PARENT_SELECTOR}`)).to.exist;
  });

  it('should show the title of area', function() {
    // then
    expect(find(TITLE_SELECTOR).textContent).to.include(area.title);
  });

  it('should include one competences line per competence', function() {
    // then
    expect(findAll(COMPETENCE_SELECTOR)).to.have.lengthOf(area.resultCompetences.length);
  });

  context('on a specific line of competence', function() {

    context('when competence level is -1', function() {

      it('should be grayed out (almost transparent) and not show the level', function() {
        expect(find(`${COMPETENCE_SELECTOR}:nth-child(3) span`).textContent).to.equal(area.resultCompetences[1].level.toString());
        expect(find(`${COMPETENCE_SELECTOR}:nth-child(3) p`).classList.toString()).to.include(DISABLED_CLASS);
      });
    });

    context('when competence level is 0', function() {

      it('should show "-" for the level (not 0)', function() {
        expect(find(`${COMPETENCE_SELECTOR}:nth-child(4) span`).textContent).to.equal('-');
        expect(find(`${COMPETENCE_SELECTOR}:nth-child(4) p`).classList.toString()).to.not.include(DISABLED_CLASS);
      });
    });

    context('when competence level is greater or equal than 1', function() {

      it('should show the level', function() {
        expect(find(`${COMPETENCE_SELECTOR}:nth-child(5) span`).textContent).to.equal('3');
        expect(find(`${COMPETENCE_SELECTOR}:nth-child(5) p`).classList.toString()).to.not.include(DISABLED_CLASS);
      });
    });
  });
});
