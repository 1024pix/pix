import PixBreadcrumb from '@1024pix/pix-ui/components/pix-breadcrumb';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import pageTitle from 'ember-page-title/helpers/page-title';
import CombinedCourseBlueprintForm from 'pix-admin/components/combined-course-blueprints/form';

export default class EditCombinedCourseBlueprint extends Component {
  @service intl;

  <template>
    <div>
      <PixBreadcrumb @links={{this.links}} class="combined-course-blueprint__breadcrumb" />
      <h1>{{@model.internalName}}</h1>
    </div>
    {{pageTitle "Modification du schéma de parcours combiné : " @model.internalName}}

    <main class="main-admin-form">
      <CombinedCourseBlueprintForm @model={{@model}} @updateMode={{true}} />
    </main>
  </template>

  get links() {
    return [
      {
        route: 'authenticated.combined-course-blueprints.list',
        label: this.intl.t('components.combined-course-blueprints.list.title'),
      },
      {
        label: this.args.model.internalName,
      },
    ];
  }
}
