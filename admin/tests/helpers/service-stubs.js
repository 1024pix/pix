import Service from '@ember/service';

export function stubConfigService(owner, { featureToggles, permitPixAdminLoginFromPassword } = {}) {
  class ConfigServiceStub extends Service {
    constructor() {
      super();

      this.featureToggles = featureToggles ?? {};
      this.permitPixAdminLoginFromPassword = permitPixAdminLoginFromPassword ?? false;
    }

    load() {
      return Promise.resolve();
    }
  }

  owner.unregister('service:config');
  owner.register('service:config', ConfigServiceStub);
  return owner.lookup('service:config');
}
