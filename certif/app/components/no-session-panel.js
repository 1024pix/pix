import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class PanelHeader extends Component {
  @service featureToggles;

  get shouldRenderImportTemplateButton() {
    return this.featureToggles.featureToggles.isMassiveSessionManagementEnabled;
  }
}
