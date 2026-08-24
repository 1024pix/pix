import t from 'ember-intl/helpers/t';
import CopyButton from 'pix-admin/components/ui/copy-button';

<template>
  <div class="copyable-id">
    <p>ID : <span>{{@value}}</span></p>
    <CopyButton
      @id={{@copyButtonId}}
      @value={{@value}}
      @tooltip={{t "common.actions.copy-id"}}
      @label={{t "common.actions.copy-id"}}
    />
  </div>
</template>
