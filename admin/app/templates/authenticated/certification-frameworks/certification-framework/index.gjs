import PixBreadcrumb from '@1024pix/pix-ui/components/pix-breadcrumb';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import Framework from 'pix-admin/components/certification-frameworks/certification-framework/framework';
import Header from 'pix-admin/components/certification-frameworks/certification-framework/header';

export default class CertificationFrameworkTemplate extends Component {
  @service intl;

  get links() {
    return [
      {
        route: 'authenticated.certification-frameworks',
        label: this.intl.t(`components.certification-frameworks.title`),
      },
      {
        label: this.args.model.frameworkKey,
      },
    ];
  }

  <template>
    <div class="page">
      <header>
        <PixBreadcrumb @links={{this.links}} class="breadcrumb" />
      </header>

      <Header
        @certificationFramework={{@model.currentCertificationFramework}}
        @frameworkHistory={{@model.frameworkHistory}}
      />

      <section class="page-body certification-framework">
        <Framework
          @frameworkKey={{@model.frameworkKey}}
          @certificationFramework={{@model.currentCertificationFramework}}
          @hasTargetProfilesHistory={{@model.hasTargetProfilesHistory}}
          @frameworkHistory={{@model.frameworkHistory}}
        />
      </section>
    </div>
  </template>
}
