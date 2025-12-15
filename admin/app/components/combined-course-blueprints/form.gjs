import PixBlock from '@1024pix/pix-ui/components/pix-block';
import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixRadioButton from '@1024pix/pix-ui/components/pix-radio-button';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import PixTextarea from '@1024pix/pix-ui/components/pix-textarea';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { eq, gt } from 'ember-truth-helpers';
import PixFieldset from 'pix-admin/components/ui/pix-fieldset';

export default class CombineCourseBluePrintForm extends Component {
  @service pixToast;

  @tracked combinedCourseItems = [];
  @tracked itemId = null;
  @tracked itemType = 'targetProfile';
  @tracked name = '';
  @tracked illustration = '';
  @tracked description = '';
  @tracked organizationIds = null;
  @tracked creatorId = null;

  @action
  addItem(event) {
    event.preventDefault();
    if (this.itemType === 'targetProfile') {
      this.addTargetProfile();
    } else {
      this.addModule();
    }

    document.getElementsByName('itemType')[0].focus();
  }

  addTargetProfile() {
    this.combinedCourseItems = [
      ...this.combinedCourseItems,
      {
        type: 'campaignParticipations',
        value: Number(this.itemId),
      },
    ];
    this.itemId = null;
  }

  addModule() {
    this.combinedCourseItems = [
      ...this.combinedCourseItems,
      {
        type: 'passages',
        value: this.itemId,
      },
    ];
    this.itemId = null;
  }

  @action
  async downloadCSV() {
    try {
      const jsonParsed = JSON.stringify({
        name: this.name,
        description: this.description,
        illustration: this.illustration,
        combinedCourseContent: this.combinedCourseItems,
      });
      const exportedData = [
        ['Identifiant des organisations*', 'Identifiant du createur des campagnes*', 'Json configuration for quest*'],
        [this.organizationIds, this.creatorId, jsonParsed],
      ];

      const csvContent = exportedData
        .map((line) => line.map((data) => `"${data.replaceAll('"', '""').replaceAll('\\""', '\\"')}"`).join(';'))
        .join('\n');

      const exportLink = document.createElement('a');
      exportLink.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
      exportLink.setAttribute('download', `${this.name}.csv`);
      exportLink.click();

      this.pixToast.sendSuccessNotification({
        message: this.intl.t('components.combined-courses.create-form.notifications.success'),
      });
    } catch {
      this.pixToast.sendErrorNotification({
        message: this.intl.t('components.combined-courses.create-form.notifications.error'),
      });
    }
  }

  getItemType(item) {
    return item.type === 'campaignParticipations' ? 'targetProfile' : 'module';
  }

  getItemValue(item) {
    return item.value;
  }

  getItemColor(item) {
    return item.type === 'campaignParticipations' ? 'purple' : 'blue';
  }

  @action
  setData(key, e) {
    this[key] = e.target.value;
  }

  @action
  handleKeyPress(event) {
    if (event.key === 'Enter') {
      this.setData('itemId', event);
      this.addItem(event);
    }
  }

  <template>
    <PixBlock @variant="admin" class="combined-course-page">

      <form class="combined-course-page__form">
        <h1 class="combined-course-page__title"> {{t "components.combined-courses.create-form.title"}}</h1>

        <PixFieldset>
          <:title>
            {{t "components.combined-courses.create-form.fieldsetElement"}}
          </:title>
          <:content>
            <div class="combined-course-page__fieldset">
              <PixRadioButton
                name="itemType"
                @value="targetProfile"
                checked={{if (eq this.itemType "targetProfile") "checked"}}
                {{on "change" (fn this.setData "itemType")}}
              >
                <:label>{{t "components.combined-courses.create-form.labels.target-profile"}}</:label>
              </PixRadioButton>
              <PixRadioButton
                name="itemType"
                checked={{if (eq this.itemType "module") "checked"}}
                @value="module"
                {{on "change" (fn this.setData "itemType")}}
              >
                <:label>{{t "components.combined-courses.create-form.labels.module"}}</:label>
              </PixRadioButton>
            </div>
          </:content>
        </PixFieldset>

        <div class="combined-course-page__form-addItem">
          <PixInput
            @id="itemId"
            @value={{this.itemId}}
            @requiredLabel="Champ obligatoire"
            {{on "change" (fn this.setData "itemId")}}
            {{on "keyup" this.handleKeyPress}}
            class="combined-course-page__input"
          >
            <:label>
              {{t "components.combined-courses.create-form.labels.itemId"}}
            </:label>
          </PixInput>

          <PixButton @triggerAction={{this.addItem}} class="combined-course-page__button">{{t
              "components.combined-courses.create-form.addItemButton"
            }}</PixButton>
        </div>
        <hr class="combined-course-page__separator" />
        <PixInput
          @id="name"
          @value={{this.name}}
          @requiredLabel="Champ obligatoire"
          {{on "change" (fn this.setData "name")}}
          class="combined-course-page__input"
        >
          <:label>
            {{t "components.combined-courses.create-form.labels.name"}}
          </:label>
        </PixInput>

        <PixInput
          @id="illustration"
          @value={{this.illustration}}
          @requiredLabel="Champ obligatoire"
          {{on "change" (fn this.setData "illustration")}}
          class="combined-course-page__input"
        >
          <:label>
            {{t "components.combined-courses.create-form.labels.illustration"}}

          </:label>
        </PixInput>

        <PixTextarea
          @id="description"
          @value={{this.description}}
          @requiredLabel="Champ obligatoire"
          {{on "change" (fn this.setData "description")}}
          class="combined-course-page__input"
          rows="10"
        >
          <:label>
            {{t "components.combined-courses.create-form.labels.description"}}

          </:label>
        </PixTextarea>

        <hr class="combined-course-page__separator" />

        <PixInput
          @id="organizationIds"
          @value={{this.organizationIds}}
          @requiredLabel="Champ obligatoire"
          {{on "change" (fn this.setData "organizationIds")}}
          class="combined-course-page__input"
        >
          <:label>
            {{t "components.combined-courses.create-form.labels.organizationsList"}}
          </:label>
          <:subLabel>
            {{t "components.combined-courses.create-form.labels.organizationsListSubLabel"}}
          </:subLabel>
        </PixInput>

        <PixInput
          @id="creatorId"
          @value={{this.creatorId}}
          @requiredLabel="Champ obligatoire"
          {{on "change" (fn this.setData "creatorId")}}
          class="combined-course-page__input"
        >
          <:label>
            {{t "components.combined-courses.create-form.labels.creatorId"}}
          </:label>
        </PixInput>

      </form>

      <div class="combined-course-page__items">
        <h2 class="combined-course-page__title">
          {{t "components.combined-courses.create-form.courseContent"}}</h2>

        {{#if (gt this.combinedCourseItems.length 0)}}
          <ul class="combined-course-page__list">
            {{#each this.combinedCourseItems as |item|}}
              <li class="combined-course-page__list-item"><PixTag @color={{this.getItemColor item}}>
                  {{this.getItemType item}}
                  -
                  {{this.getItemValue item}}
                </PixTag>
              </li>
            {{/each}}
          </ul>
        {{else}}
          <p> {{t "components.combined-courses.create-form.contentFeedback"}}</p>
        {{/if}}

        <PixButton class="combined-course-page__button" @triggerAction={{this.downloadCSV}} @variant="success">{{t
            "components.combined-courses.create-form.downloadButton"
          }}</PixButton>
      </div>
    </PixBlock>
  </template>
}
