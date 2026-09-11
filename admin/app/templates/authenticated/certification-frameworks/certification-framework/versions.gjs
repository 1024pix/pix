import PixBreadcrumb from '@1024pix/pix-ui/components/pix-breadcrumb';
import PixStepper from '@1024pix/pix-ui/components/pix-stepper';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';

export default class CertificationVerionsTemplate extends Component {
  @service intl;
  @service router;

  get steps() {
    return [
      { title: this.intl.t('components.certification-frameworks.certification-framework.versions.stepper.step-1') },
      { title: this.intl.t('components.certification-frameworks.certification-framework.versions.stepper.step-2') },
      { title: this.intl.t('components.certification-frameworks.certification-framework.versions.stepper.step-3') },
      { title: this.intl.t('components.certification-frameworks.certification-framework.versions.stepper.step-4') },
    ];
  }

  get currentStep() {
    const routeName = this.router.currentRouteName;
    if (routeName.includes('.new')) return 1;
    if (routeName.includes('.edit')) return 2;
    if (routeName.includes('.calibration')) return 3;
    if (routeName.includes('.scoring')) return 4;
    return 1;
  }

  get links() {
    return [
      {
        route: 'authenticated.certification-frameworks',
        label: this.intl.t(`components.certification-frameworks.title`),
      },
      {
        route: 'authenticated.certification-frameworks.certification-framework',
        query: this.args.model.certificationFramework.scope,
        label: this.args.model.certificationFramework.scope,
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
      {{t
        "components.certification-frameworks.certification-framework.versions.page-title"
        scope=@model.certificationFramework.scope
      }}
    </h2>
    <PixStepper class="version-creation-form__stepper" @steps={{this.steps}} @currentStep={{this.currentStep}} />
    {{outlet}}
  </template>
}
