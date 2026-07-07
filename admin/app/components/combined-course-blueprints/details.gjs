import PixBreadcrumb from '@1024pix/pix-ui/components/pix-breadcrumb';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import formatDate from 'ember-intl/helpers/format-date';
import { pageTitle } from 'ember-page-title';
import { or } from 'ember-truth-helpers';
import DownloadCombinedCourseBlueprint from 'pix-admin/components/combined-course-blueprints/download-combined-course-blueprint';
import { DescriptionList } from 'pix-admin/components/ui/description-list';

import RequirementTag from '../common/combined-courses/requirement-tag';
import SafeMarkdownToHtml from '../safe-markdown-to-html';

export default class Details extends Component {
  @service intl;
  @service currentUser;

  get isSuperAdmin() {
    return this.currentUser.adminMember.isSuperAdmin;
  }

  <template>
    {{pageTitle "Profil " @model.id " | Pix Admin" replace=true}}
    <div class="page">
      <header>
        <div>
          <PixBreadcrumb @links={{this.links}} class="combined-course-blueprint__breadcrumb" />
          <h1>{{@model.internalName}}</h1>
        </div>
        <div class="page-actions">
          <DownloadCombinedCourseBlueprint
            @variant="success"
            @blueprint={{@model}}
            @creatorId={{this.currentUser.adminMember.userId}}
          />
        </div>
      </header>

      <main class="page-body">
        <section class="page-section">
          <div class="combined-course-blueprint__container">

            <DescriptionList>

              <DescriptionList.Item @label={{t "components.combined-course-blueprints.labels.itemId"}}>
                {{@model.id}}
              </DescriptionList.Item>

              <DescriptionList.Item @label={{t "components.combined-course-blueprints.labels.internal-name"}}>
                {{@model.internalName}}
              </DescriptionList.Item>

              <DescriptionList.Item @label={{t "components.combined-course-blueprints.labels.name"}}>
                {{@model.name}}
              </DescriptionList.Item>

              <DescriptionList.Item @label={{t "components.combined-course-blueprints.labels.created-at"}}>
                {{formatDate @model.createdAt}}
              </DescriptionList.Item>

              <DescriptionList.Item @label={{t "components.combined-course-blueprints.labels.attestation"}}>
                <SafeMarkdownToHtml @markdown={{@model.attestationLabel}} />
              </DescriptionList.Item>

              {{#if @model.rewardRequirements}}
                <DescriptionList.Item @label={{t "components.combined-course-blueprints.labels.reward-requirements"}}>
                  <SafeMarkdownToHtml @markdown={{@model.rewardRequirements}} />
                </DescriptionList.Item>
              {{/if}}

              {{#if @model.description}}
                <DescriptionList.Item @label={{t "components.combined-course-blueprints.labels.description"}}>
                  <SafeMarkdownToHtml @markdown={{@model.description}} />
                </DescriptionList.Item>
              {{/if}}

              <DescriptionList.Item @label={{t "components.combined-course-blueprints.labels.survey-link"}}>
                {{or @model.surveyLink (t "components.combined-course-blueprints.survey-link.not-provided")}}
              </DescriptionList.Item>

              {{#if @model.illustration}}
                <DescriptionList.Item @label={{t "components.combined-course-blueprints.labels.illustration"}}>
                  <img src={{@model.illustration}} alt="" />
                </DescriptionList.Item>
              {{/if}}

            </DescriptionList>
            {{#if this.isSuperAdmin}}
              <PixButtonLink
                @route="authenticated.combined-course-blueprints.edit"
                @model={{@model.id}}
                @size="small"
                @variant="primary"
                class="combined-course-blueprint__button"
              >
                {{t "common.actions.edit"}}
              </PixButtonLink>
            {{/if}}
            <h2 class="page-section__title">{{t "components.combined-course-blueprints.items.title"}}</h2>
            <div class="combined-course-blueprint__content">
              {{#each @model.content as |requirement|}}
                <RequirementTag @requirement={{requirement}} />
              {{/each}}
            </div>
          </div>
        </section>
      </main>
    </div>
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
