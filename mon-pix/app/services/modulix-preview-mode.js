import Service from '@ember/service';

export default class ModulixPreviewModeService extends Service {
  isEnabled = false;

  enable() {
    this.isEnabled = true;
  }
}
