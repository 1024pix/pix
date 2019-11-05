import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import EmberObject from '@ember/object';

describe('Unit | Service | peeker', function() {
  setupTest();

  let service, obj1, obj2, obj3;
  beforeEach(function() {
    service = this.owner.lookup('service:peeker');

    obj1 = EmberObject.create({ name: 'Michel', lastName: 'Essentiel', age: 20 , fruit: 'apple' });
    obj2 = EmberObject.create({ name: 'Michel', lastName: 'Essentiel', age: 40, address: '42 baker street' });
    obj3 = EmberObject.create({ name: 'Jacqueline', lastName: 'Jackson', age: 57, address: '42 baker street' });

    sinon.stub(service.store, 'peekAll').withArgs('model').returns([obj1, obj2, obj3]);
  });

  describe('get', () => {
    it('should get a single item', () => {
      const jacqueline = service.get('model', { name: 'Jacqueline' });
      expect(jacqueline).to.deep.equal(obj3);
    });
    it('should throw an error when multiple items match', function() {
      try {
        service.get('model', { name: 'Michel' });
      } catch (err) {
        expect(err).to.be.instanceOf(Error);
      }
    });
    it('should throw an error when no items match', function() {
      try {
        service.get('model', { name: 'None' });
      } catch (err) {
        expect(err).to.be.instanceOf(Error);
      }
    });
  });

  describe('findOne', () => {
    it('should find a single item', () => {
      const jacqueline = service.findOne('model', { name: 'Jacqueline' });
      expect(jacqueline).to.deep.equal(obj3);
    });
    it('should not throw an error when no single item can be found', function() {
      const none = service.findOne('model', { name: 'None' });
      expect(none).to.be.undefined;
    });
  });

  describe('find', () => {
    it('should find all items matching a given criteria', () => {
      const michels = service.find('model', (user) => user.name === 'Michel');
      expect(michels).to.deep.equal([obj1, obj2]);
    });
    it('should support shorthand syntax', () => {
      const michels = service.find('model', { name: 'Michel' });
      expect(michels).to.deep.equal([obj1, obj2]);
    });
    it('should return an empty array when none matches', () => {
      const michels = service.find('model', { name: 'None' });
      expect(michels).to.deep.equal([]);
    });
  });

  describe('haveCommonProperties', () => {
    it('should consider two objects equals if they have properties in common', function() {
      expect(service.haveCommonProperties(['name', 'lastName'], obj1, obj2)).to.be.true;
    });
    it('should not consider two objects equals if they have properties in common', function() {
      expect(service.haveCommonProperties(['name', 'age'], obj1, obj2)).to.be.false;
    });
    it('should not consider two identical object equals if no comparing keys are passed', function() {
      expect(service.haveCommonProperties([], obj1, obj1)).to.be.false;
    });
  });

});
