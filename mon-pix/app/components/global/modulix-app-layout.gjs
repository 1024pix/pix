import PixAppLayout from '@1024pix/pix-ui/components/pix-app-layout';
import { service } from '@ember/service';
import Component from '@glimmer/component';

import CommunicationBanner from '../communication-banner';
import InformationBanners from '../information-banners';
import ModulixNavigation from '../module/layout/navigation';

export default class ModulixAppLayout extends Component {
  @service featureToggles;
  @service store;
  @service router;

  get currentModule() {
    const moduleSlug = this.router.currentRoute.parent.params.slug;
    const modules = this.store.peekAll('module');
    return modules.find((module) => module.slug === moduleSlug);
  }

  get isNewPattern() {
    return this.currentModule.isNewPattern;
  }

  get currentModuleSections() {
    return this.currentModule.sections;
  }

  get shouldDisplayNavigation() {
    return this.args.isModulixPassage && this.isNewPattern;
  }

  <template>
    <PixAppLayout
      @variant="modulix"
      class="modulix-layout {{unless @isModulixPassage 'modulix-layout--page-without-navbar'}}"
    >
      <:banner>
        <CommunicationBanner />
        <InformationBanners @banners={{@banners}} />
      </:banner>
      <:navigation>
        {{#if this.shouldDisplayNavigation}}
          <ModulixNavigation @sections={{this.currentModuleSections}} @glossary={{this.currentModule.glossary}} />
        {{/if}}
      </:navigation>
      <:main>
        {{yield}}
      </:main>
    </PixAppLayout>
  </template>
}
