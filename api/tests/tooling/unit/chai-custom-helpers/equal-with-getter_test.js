import { expect } from '../../../test-helper.js';

describe('Unit | chai-custom-helpers | equalWithGetter', function () {
  class A {
    get name() {
      return "i'm A";
    }
  }
  class B {
    get name() {
      return "i'm B";
    }
    get A() {
      return [new A()];
    }
  }

  it('should expect on object', function () {
    expect({ name: 'ho' }).equalWithGetter({ name: 'ho' });
  });

  it('should expect on array of object', function () {
    expect([{ name: 'ho' }]).equalWithGetter([{ name: 'ho' }]);
  });

  it('should expect on class instance with getter', function () {
    expect(new A()).equalWithGetter({ name: "i'm A" });
  });

  it('should expect on array of class instance with getter', function () {
    expect([new A()]).equalWithGetter([{ name: "i'm A" }]);
  });

  it('should expect on nested class instance with getter', function () {
    expect(new B()).equalWithGetter({ name: "i'm B", A: [{ name: "i'm A" }] });
  });

  it('should expect on array nested class instance with getter', function () {
    expect([new B()]).equalWithGetter([{ name: "i'm B", A: [{ name: "i'm A" }] }]);
  });
});
