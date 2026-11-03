import {
  PixButton,
  PixIconButton,
  PixInput,
  PixRadioButton,
  PixTable,
  PixTableColumn,
  PixTag,
} from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { eq, gt } from 'ember-truth-helpers';

import Card from '../../card';

const uniqById = (items) => {
  const seenIds = new Set();
  return items.filter((item) => {
    if (seenIds.has(item.id)) return false;
    seenIds.add(item.id);
    return true;
  });
};

const sortByIndex = (items) => items.toSorted((a, b) => (a.index > b.index) - (a.index < b.index));

export default class ContentSection extends Component {
  @service intl;
  @service pixToast;
  @service store;

  @tracked itemType = 'campaign';
  @tracked itemValue = null;
  @tracked itemAddDisabled = true;
  @tracked itemToAdd = null;
  @tracked targetProfilesSnapshots = [];
  @tracked currentTargetProfile = null;

  @action
  setItemType(e) {
    this.itemType = e.target.value;
    this.itemValue = null;
    this.itemAddDisabled = true;
    this.itemToAdd = null;
  }

  @action
  async setItemValue(e) {
    this.itemValue = e.target.value;

    if (!this.itemValue) {
      this.itemAddDisabled = true;
      this.itemToAdd = null;
    } else {
      this.itemAddDisabled = false;
      await this.previewItem();
    }
  }

  @action
  handleKeyPress(event) {
    if (event.key === 'Enter') {
      this.setItemValue(event);
      this.addItem(event);
    }
  }

  @action
  async addItem(event) {
    event.preventDefault();

    this.addToContent();

    if (this.itemType === 'campaign') {
      this.currentTargetProfile = await this.store.findRecord('target-profile', this.itemValue, { reload: true });
      await this.refreshAreas();
    }

    this.itemValue = null;
    document.getElementsByName('itemType')[0].focus();
    this.itemToAdd = null;
  }

  @action
  async removeItem(index) {
    const itemToRetrieve = this.args.blueprint.content.find((item, i) => i === index);
    if (itemToRetrieve.type === 'campaign') {
      this.targetProfilesSnapshots = this.targetProfilesSnapshots.filter(
        (targetProfileSnapshot) => targetProfileSnapshot.id != itemToRetrieve.value,
      );
      await this.refreshAreas();
    }
    this.args.blueprint.content = this.args.blueprint.content.filter((item, i) => i !== index);
  }

  @action
  getItemColor(type) {
    return type === 'campaign' ? 'purple' : 'blue';
  }

  async previewItem() {
    this.itemToAdd = null;

    try {
      if (this.itemType === 'module') {
        const module = await this.store.findRecord('module', this.itemValue);
        this.itemToAdd = {
          type: 'module',
          value: module.id,
          label: module.title,
          shortId: module.shortId,
          image: module.details.image,
        };
      } else {
        const targetProfile = await this.store.findRecord('target-profile', this.itemValue);
        this.itemToAdd = {
          type: 'campaign',
          value: Number(this.itemValue),
          label: targetProfile.internalName,
          image: targetProfile.imageUrl,
        };
      }
    } catch (responseError) {
      this.#handleErrorForResource(this.itemType, responseError);
      this.itemAddDisabled = true;
    }
  }

  #handleErrorForResource(resourceName, responseError) {
    if (responseError.errors?.some(({ status }) => status === '404')) {
      this.pixToast.sendErrorNotification({
        message: this.intl.t(`components.combined-course-blueprints.create.notifications.${resourceName}NotFound`),
      });
    } else {
      this.pixToast.sendErrorNotification({
        message: this.intl.t('components.combined-course-blueprints.create.notifications.addItemError'),
      });
    }
  }

  addToContent() {
    this.args.blueprint.content = [...this.args.blueprint.content, this.itemToAdd];
  }

  async refreshAreas() {
    if (this.currentTargetProfile) {
      const currentTargetProfileSnapshot = await this.#snapshotTargetProfile(this.currentTargetProfile);

      this.targetProfilesSnapshots = [...this.targetProfilesSnapshots, currentTargetProfileSnapshot];
      this.currentTargetProfile = null;
    }
    const areas = this.targetProfilesSnapshots.flatMap((snapshot) => snapshot.areas);
    const competences = areas.flatMap((area) => area.competences);
    const thematics = competences.flatMap((competence) => competence.thematics);

    const childrenOf = (nodes, parentId, key) =>
      uniqById(nodes.filter((node) => node.id === parentId).flatMap((node) => node[key]));

    const sortedAreas = uniqById(areas).map((area) => ({
      ...area,
      sortedCompetences: sortByIndex(childrenOf(areas, area.id, 'competences')).map((competence) => ({
        ...competence,
        sortedThematics: sortByIndex(childrenOf(competences, competence.id, 'thematics')).map((thematic) => ({
          ...thematic,
          tubes: childrenOf(thematics, thematic.id, 'tubes'),
        })),
      })),
    }));

    this.args.onAreasChange(sortedAreas);
  }

  async #snapshotTargetProfile(targetProfile) {
    const areas = await targetProfile.areas;

    return {
      id: targetProfile.id,
      areas: await Promise.all(
        areas.map(async (area) => ({
          id: area.id,
          code: area.code,
          title: area.title,
          color: area.color,
          competences: await Promise.all(
            (await area.competences).map(async (competence) => ({
              id: competence.id,
              index: competence.index,
              name: competence.name,
              thematics: await Promise.all(
                (await competence.thematics).map(async (thematic) => ({
                  id: thematic.id,
                  index: thematic.index,
                  name: thematic.name,
                  tubes: ((await thematic.tubes) ?? []).map((tube) => ({
                    id: tube.id,
                    name: tube.name,
                    practicalTitle: tube.practicalTitle,
                    level: tube.level,
                    mobile: tube.mobile,
                    tablet: tube.tablet,
                  })),
                })),
              ),
            })),
          ),
        })),
      ),
    };
  }

  <template>
    <Card
      class="combined-course-blueprint-form__card"
      @title={{t "components.combined-course-blueprints.create.content"}}
    >
      <div class="content-section">
        <div class="content-section__add-items-column">
          <fieldset class="content-section__add-items-column--options">
            <legend>{{t "components.combined-course-blueprints.create.fieldsetElement"}}</legend>
            <PixRadioButton
              name="itemType"
              @value="campaign"
              checked={{if (eq this.itemType "campaign") "checked"}}
              {{on "change" this.setItemType}}
            >
              <:label>{{t "components.combined-course-blueprints.labels.target-profile"}}</:label>
            </PixRadioButton>
            <PixRadioButton
              name="itemType"
              checked={{if (eq this.itemType "module") "checked"}}
              @value="module"
              {{on "change" this.setItemType}}
            >
              <:label>{{t "components.combined-course-blueprints.labels.module"}}</:label>
            </PixRadioButton>
          </fieldset>
          <div class="content-section__add-item">
            <PixInput
              @id="itemId"
              @value={{this.itemValue}}
              @requiredLabel="Champ obligatoire"
              {{on "change" this.setItemValue}}
              {{on "keyup" this.handleKeyPress}}
              class="combined-course-blueprint-form__input"
            >
              <:label>
                {{t "components.combined-course-blueprints.labels.itemId"}}
              </:label>
            </PixInput>
          </div>
          {{#if this.itemToAdd}}
            <Card class="combined-course-blueprint-form__card--item-to-add">
              <div class="combined-course-blueprint-form__card--image">
                <img src={{this.itemToAdd.image}} alt={{this.itemToAdd.label}} />
              </div>
              <div class="combined-course-blueprint-form__card--item-to-add-text">
                <PixTag class="combined-course-blueprint-form__card--requirement-tag">{{this.itemToAdd.type}}</PixTag>
                {{#if (eq this.itemToAdd.type "module")}}
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://app.recette.pix.fr/modules/{{this.itemToAdd.shortId}}/slug/details"
                  >{{this.itemToAdd.label}}</a>
                {{/if}}
                {{#if (eq this.itemToAdd.type "campaign")}}
                  <LinkTo
                    @route="authenticated.target-profiles.target-profile.details"
                    @model={{this.itemToAdd.value}}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{this.itemToAdd.label}}
                  </LinkTo>
                {{/if}}
              </div>
            </Card>
          {{/if}}
          <PixButton
            @isDisabled={{this.itemAddDisabled}}
            @variant="secondary"
            @triggerAction={{this.addItem}}
            class="combined-course-blueprint-form__button"
          >{{t "components.combined-course-blueprints.create.addItemButton"}}</PixButton>
        </div>
        <div class="content-section__items-preview-column">
          <h3 class="content-section__title">
            {{t "components.combined-course-blueprints.create.courseContent"}}</h3>
          <div>
            {{#if (gt @blueprint.content.length 0)}}
              <PixTable @variant="admin" @data={{@blueprint.content}} class="table">
                <:columns as |row context index|>
                  <PixTableColumn @context={{context}}>
                    <:header>
                      {{t "components.combined-course-blueprints.items.item-type-header"}}
                    </:header>
                    <:cell>
                      <PixTag @color={{this.getItemColor row.type}}>{{row.type}}</PixTag>
                    </:cell>
                  </PixTableColumn>
                  <PixTableColumn @context={{context}}>
                    <:header>
                      {{t "components.combined-course-blueprints.items.item-name-header"}}
                    </:header>
                    <:cell>
                      {{#if (eq row.type "module")}}
                        {{row.shortId}}
                      {{else}}
                        {{row.value}}
                      {{/if}}
                      {{row.label}}
                    </:cell>
                  </PixTableColumn>
                  <PixTableColumn @context={{context}}>
                    <:header>
                      {{t "components.combined-course-blueprints.items.action-header"}}
                    </:header>
                    <:cell>
                      <PixIconButton
                        @iconName="delete"
                        @triggerAction={{fn this.removeItem index}}
                        @ariaLabel="Supprimer"
                        data-testid="delete-{{index}}"
                      />
                    </:cell>
                  </PixTableColumn>
                </:columns>

              </PixTable>
            {{else}}
              <p> {{t "components.combined-course-blueprints.create.contentFeedback"}}</p>
            {{/if}}
          </div>
        </div>
      </div>
    </Card>
  </template>
}
