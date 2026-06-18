import ApplicationSerializer from './application';

export default class AttachedCertificationCenterSerializer extends ApplicationSerializer {
  modelNameFromPayloadKey(key) {
    if (key === 'certification-centers') {
      return 'attached-certification-center';
    }
    return super.modelNameFromPayloadKey(key);
  }
}
