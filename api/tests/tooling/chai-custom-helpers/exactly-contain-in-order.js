import { Assertion } from 'chai';
export function exactlyContainInOrder() {
  Assertion.addMethod('exactlyContainInOrder', function (expectedElements) {
    const errorMessage = `expect [${this._obj}] to exactly contain in order [${expectedElements}]`;
    new Assertion(this._obj, errorMessage).to.deep.equal(expectedElements);
  });
}
