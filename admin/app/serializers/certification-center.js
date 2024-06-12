import ApplicationSerializer from './application';

export default class CertificationCenter extends ApplicationSerializer {
  attrs = {
    habilitations: { serialize: true },
  };
}
