import { describe, beforeEach, afterEach } from 'mocha';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

export default function(name) {
  describe("visiting " + name, function() {
    beforeEach(function() {
      this.application = startApp();
    });

    afterEach(function() {
      return destroyApp(this.application);
    });
  });
}
