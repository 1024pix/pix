import { Assertion } from 'chai';

const deepEqualArray = function () {
  Assertion.addMethod('deepEqualArray', function (referenceArray) {
    const assertedArray = this._obj;

    _assertIsArray(assertedArray);
    _assertIsArray(referenceArray);
    _assertArraysHaveSameLength(assertedArray, referenceArray);

    for (let i = 0; i < assertedArray.length; ++i) {
      _assertDeepEqualInstance(assertedArray[i], referenceArray[i]);
    }
  });
};

function _assertIsArray(value) {
  const instanceClassName = value.constructor.name;
  new Assertion(instanceClassName).to.equal('Array');
}

function _assertArraysHaveSameLength(array1, array2) {
  const array1Length = array1.length;
  const array2Length = array2.length;
  new Assertion(array1Length).to.equal(array2Length);
}

function _assertDeepEqualInstance(instance1, instance2) {
  new Assertion(instance1).to.deepEqualInstance(instance2);
}

export { deepEqualArray };
