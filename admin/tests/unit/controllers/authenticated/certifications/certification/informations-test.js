import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import EmberObject from '@ember/object';

module('Unit | Controller | authenticated/certifications/certification/informations', function(hooks) {

  setupTest(hooks);

  const competence = (code, score, level) => {
    return {
      'competence_code': code,
      score: score,
      level: level
    };
  };

  test('it replaces competence score correctly', function(assert) {
    // Given
    const controller = this.owner.lookup('controller:authenticated/certifications/certification/informations');
    controller.set('model', EmberObject.create({
      competencesWithMark:[competence('1.1', 24, 3), competence('3.1',40, 5), competence('5.2',33, 4)]
    }));

    // When
    controller.send('onUpdateScore', '3.1', '55');

    // Then
    const competences = controller.get('model.competencesWithMark');
    const aCompetence = competences.filter((value) => {
      return (value['competence_code'] === '3.1');
    })[0];
    assert.equal(aCompetence.score, 55);
  });

  test('it creates competence score correctly', function(assert) {
    // Given
    const controller = this.owner.lookup('controller:authenticated/certifications/certification/informations');
    controller.set('model', EmberObject.create({
      competencesWithMark:[competence('1.1', 24, 3), competence('3.1',40, 5), competence('5.2',33, 4)]
    }));

    // When
    controller.send('onUpdateScore', '4.2', '55');

    // Then
    const competences = controller.get('model.competencesWithMark');
    const aCompetence = competences.filter((value) => {
      return (value['competence_code'] === '4.2');
    })[0];
    assert.equal(aCompetence.score, 55);
  });

  test('it replaces competence level correctly', function(assert) {
    // Given
    const controller = this.owner.lookup('controller:authenticated/certifications/certification/informations');
    controller.set('model', EmberObject.create({
      competencesWithMark:[competence('1.1', 24, 3), competence('3.1',40, 5), competence('5.2',33, 4)]
    }));

    // When
    controller.send('onUpdateLevel', '5.2', '5');

    // Then
    const competences = controller.get('model.competencesWithMark');
    const aCompetence = competences.filter((value) => {
      return (value['competence_code'] === '5.2');
    })[0];
    assert.equal(aCompetence.level, 5);
  });

  test('it creates competence level correctly', function(assert) {
    // Given
    const controller = this.owner.lookup('controller:authenticated/certifications/certification/informations');
    controller.set('model', EmberObject.create({
      competencesWithMark:[competence('1.1', 24, 3), competence('3.1',40, 5), competence('5.2',33, 4)]
    }));

    // When
    controller.send('onUpdateLevel', '4.3', '8');

    // Then
    const competences = controller.get('model.competencesWithMark');
    const aCompetence = competences.filter((value) => {
      return (value['competence_code'] === '4.3');
    })[0];
    assert.equal(aCompetence.level, 8);
  });

  test('it removes competence correctly', function(assert) {
    // Given
    const controller = this.owner.lookup('controller:authenticated/certifications/certification/informations');
    controller.set('model', EmberObject.create({
      competencesWithMark:[competence('1.1', 24, 3), competence('3.1',40, 5), competence('5.2',33, 4)]
    }));

    // When
    controller.send('onUpdateLevel', '3.1', '');
    controller.send('onUpdateScore', '3.1', '');

    // Then
    const competences = controller.get('model.competencesWithMark');
    const aCompetence = competences.filter((value) => {
      return (value['competence_code'] === '3.1');
    });
    assert.equal(aCompetence.length, 0);
  });

  test('it restores competences when cancel is sent', function(assert) {
    // Given
    const controller = this.owner.lookup('controller:authenticated/certifications/certification/informations');
    const that = this;
    controller.set('model', EmberObject.create({
      competencesWithMark:[competence('1.1', 24, 3), competence('3.1',40, 5), competence('5.2',33, 4)],
      rollbackAttributes() { that.set('attributesRestored', true); }
    }));
    controller.send('onUpdateLevel', '1.1', '5');
    controller.send('onUpdateScore', '1.1', '50');
    controller.send('onUpdateLevel', '2.1', '4');
    controller.send('onUpdateScore', '2.1', '30');
    controller.send('onUpdateLevel', '5.2', '');
    controller.send('onUpdateScore', '5.2', '');
    this.set('attributesRestored', false);
    assert.expect(6);

    // When
    controller.send('onCancel');

    // Then
    const competences = controller.get('model.competencesWithMark');
    let aCompetence = competences.filter((value) => {
      return (value['competence_code'] === '1.1');
    })[0];
    assert.equal(aCompetence.score, 24);
    assert.equal(aCompetence.level, 3);
    aCompetence = competences.filter((value) => {
      return (value['competence_code'] === '2.1');
    });
    aCompetence = competences.filter((value) => {
      return (value['competence_code'] === '5.2');
    });
    assert.equal(aCompetence.length, 1);
    aCompetence = aCompetence[0];
    assert.equal(aCompetence.score, 33);
    assert.equal(aCompetence.level, 4);
    assert.equal(this.get('attributesRestored'), true);
  });

  test('it saves competences info when save is sent', async function(assert) {
    // Given
    const controller = this.owner.lookup('controller:authenticated/certifications/certification/informations');
    const that = this;
    controller.set('model', EmberObject.create({
      competencesWithMark:[competence('1.1', 24, 3), competence('3.1',40, 5), competence('5.2',33, 4)],
      save() {
        that.set('competenceSaved', true);
        return Promise.resolve(true);
      },
      changedAttributes() {
        return {};
      },
    }));
    this.set('competenceSaved', false);

    // When
    await controller.send('onSave');

    // Then
    assert.equal(this.get('competenceSaved'), true);
  });

  test('marks are not updated when no change has been made and save is sent', async function(assert) {
    // Given
    const controller = this.owner.lookup('controller:authenticated/certifications/certification/informations');
    const that = this;
    controller.set('model', EmberObject.create({
      competencesWithMark:[competence('1.1', 24, 3), competence('3.1',40, 5), competence('5.2',33, 4)],
      changedAttributes() {
        return {};
      },
      save(options) {
        if (options.adapterOptions.updateMarks) {
          that.set('marksUpdated', true);
        } else {
          that.set('competenceSaved', true);
        }
        return Promise.resolve(true);
      }
    }));
    this.set('competenceSaved', false);
    this.set('marksUpdated', false);
    assert.expect(2);

    // When
    await controller.send('onSave');

    // Then
    assert.equal(this.get('competenceSaved'), true);
    assert.equal(this.get('marksUpdated'), false);
  });

  test('marks are updated when change has been made to competence marks and save is sent', async function(assert) {
    // Given
    const controller = this.owner.lookup('controller:authenticated/certifications/certification/informations');
    const that = this;
    controller.set('model', EmberObject.create({
      competencesWithMark:[competence('1.1', 24, 3), competence('3.1',40, 5), competence('5.2',33, 4)],
      changedAttributes() {
        return { competencesWithMark:true };
      },
      save(options) {
        if (options.adapterOptions.updateMarks) {
          that.set('marksUpdated', true);
        } else {
          that.set('competenceSaved', true);
        }
        return Promise.resolve(true);
      }
    }));
    this.set('competenceSaved', false);
    this.set('marksUpdated', false);
    assert.expect(2);

    // When
    await controller.send('onSave');

    // Then
    assert.equal(this.get('competenceSaved'), true);
    assert.equal(this.get('marksUpdated'), true);
  });

  test('marks are updated when change has been made to pix score and save is sent', async function(assert) {
    // Given
    const controller = this.owner.lookup('controller:authenticated/certifications/certification/informations');
    const that = this;
    controller.set('model', EmberObject.create({
      competencesWithMark:[competence('1.1', 24, 3), competence('3.1',40, 5), competence('5.2',33, 4)],
      changedAttributes() {
        return { pixScore:true };
      },
      save(options) {
        if (options.adapterOptions.updateMarks) {
          that.set('marksUpdated', true);
        } else {
          that.set('competenceSaved', true);
        }
        return Promise.resolve(true);
      }
    }));
    this.set('competenceSaved', false);
    this.set('marksUpdated', false);
    assert.expect(2);

    // When
    await controller.send('onSave');

    // Then
    assert.equal(this.get('competenceSaved'), true);
    assert.equal(this.get('marksUpdated'), true);
  });

});
