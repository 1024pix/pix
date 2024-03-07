import { Assertion } from 'chai';
import _ from 'lodash';

const deepEqualInstanceOmitting = function () {
  Assertion.addMethod('deepEqualInstanceOmitting', function (referenceInstance, omittedAttributes) {
    const assertedInstance = this._obj;

    _assertAreSameType(assertedInstance, referenceInstance);
    _assertHaveSameContent(assertedInstance, referenceInstance, omittedAttributes);
  });
};

function _assertAreSameType(value1, value2) {
  const instanceClassName1 = value1.constructor.name;
  const instanceClassName2 = value2.constructor.name;
  new Assertion(instanceClassName1).to.equal(instanceClassName2);
}

function _assertHaveSameContent(value1, value2, omittedAttributes) {
  new Assertion(_.omit(value1, omittedAttributes)).to.deep.equal(_.omit(value2, omittedAttributes));
}

export { deepEqualInstanceOmitting };
