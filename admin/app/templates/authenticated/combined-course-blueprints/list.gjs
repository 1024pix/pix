import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import CombinedCourseBlueprintListSummaryItems from 'pix-admin/components/combined-course-blueprints/list-summary-items';

export default class CombinedCourseBlueprintsList extends Component {
  @service currentUser;

  get isSuperAdmin() {
    return this.currentUser.adminMember.isSuperAdmin;
  }

  <template>
    <div class="page">
      <header>
        <h1>{{t "components.combined-course-blueprints.list.title"}}</h1>
        {{#if this.isSuperAdmin}}
          <div class="page-actions">
            <PixButtonLink @route="authenticated.combined-course-blueprints.new" @variant="secondary" @iconBefore="add">
              {{t "components.combined-course-blueprints.create.title"}}
            </PixButtonLink>
          </div>
        {{/if}}
      </header>

      <main class="page-body">
        <section>
          <CombinedCourseBlueprintListSummaryItems @summaries={{@model}} />
        </section>
      </main>
    </div>
  </template>
}
