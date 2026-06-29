import PixBreadcrumb from '@1024pix/pix-ui/components/pix-breadcrumb';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';

export default class CertificationVerionsTemplate extends Component {
  @service intl;

  get links() {
    return [
      {
        route: 'authenticated.certification-frameworks',
        label: this.intl.t(`components.certification-frameworks.title`),
      },
      {
        route: 'authenticated.certification-frameworks.certification-framework',
        query: this.args.model.frameworkKey,
        label: this.args.model.frameworkKey,
      },
      {
        label: this.intl.t(`components.certification-frameworks.certification-framework.versions.title`),
      },
    ];
  }
  <template>
    <header>
      <PixBreadcrumb @links={{this.links}} class="breadcrumb" />
    </header>

    <h2 class="version-creation-form__title">
      {{t "components.certification-frameworks.certification-framework.versions.page-title" scope=@model.frameworkKey}}
    </h2>
    {{outlet}}
  </template>
}
