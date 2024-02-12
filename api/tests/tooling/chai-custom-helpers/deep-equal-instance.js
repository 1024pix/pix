import { Assertion } from 'chai';

const deepEqualInstance = function () {
  Assertion.addMethod('deepEqualInstance', function (referenceInstance) {
    const assertedInstance = this._obj;

    _assertAreSameType(assertedInstance, referenceInstance);
    _assertHaveSameContent(assertedInstance, referenceInstance);
  });
};

function _assertAreSameType(value1, value2) {
  const instanceClassName1 = value1.constructor.name;
  const instanceClassName2 = value2.constructor.name;
  new Assertion(instanceClassName1).to.equal(instanceClassName2);
}

function _assertHaveSameContent(value1, value2) {
  new Assertion(value1).to.deep.equal(value2);
}

export { deepEqualInstance };
