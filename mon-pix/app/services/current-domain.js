import Service from '@ember/service';
import last from 'lodash/last';
import PixWindow from 'mon-pix/utils/pix-window';

const FRANCE_TLD = 'fr';

export default class CurrentDomainService extends Service {
  getExtension() {
    return last(PixWindow.getLocationHostname().split('.'));
  }

  get isFranceDomain() {
    return this.getExtension() === FRANCE_TLD;
  }
}
