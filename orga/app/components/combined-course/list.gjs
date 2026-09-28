import { PixTable, PixTableColumn } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import ActivityType from 'pix-orga/components/activity-type';

const stopPropagation = (event) => {
  event.stopPropagation();
};

export default class CombinedCourseList extends Component {
  @service router;

  @action
  goToCombinedCourse({ id }) {
    this.router.transitionTo('authenticated.combined-course', id);
  }

  <template>
    <PixTable
      @variant="orga"
      @caption={{t "pages.combined-courses.table.caption"}}
      @data={{@combinedCourses}}
      class="table"
      @onRowClick={{this.goToCombinedCourse}}
    >
      <:columns as |combinedCourse context|>
        <PixTableColumn @context={{context}}>
          <:header>
            {{t "pages.combined-courses.table.column.name"}}
          </:header>
          <:cell>
            <span class="table__link-cell">
              <ActivityType @type="COMBINED_COURSE" @hideLabel={{true}} />
              <LinkTo @route="authenticated.combined-course" @model={{combinedCourse.id}}>
                {{combinedCourse.name}}
              </LinkTo>
            </span>
          </:cell>
        </PixTableColumn>

        <PixTableColumn @context={{context}}>
          <:header>
            {{t "pages.combined-courses.table.column.code"}}
          </:header>
          <:cell>
            <span {{on "click" stopPropagation}}>
              {{combinedCourse.code}}
            </span>
          </:cell>
        </PixTableColumn>

        <PixTableColumn @context={{context}} @type="number">
          <:header>
            {{t "pages.combined-courses.table.column.participants"}}
          </:header>
          <:cell>

            {{combinedCourse.participationsCount}}
          </:cell>
        </PixTableColumn>

        <PixTableColumn @context={{context}} @type="number">
          <:header>
            {{t "pages.combined-courses.table.column.completed"}}
          </:header>
          <:cell>
            {{combinedCourse.completedParticipationsCount}}
          </:cell>
        </PixTableColumn>
      </:columns>
    </PixTable>
  </template>
}
