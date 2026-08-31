import { modifier } from 'ember-modifier';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

const mountReact = modifier((element, [ReactComponent, props]) => {
  const root = createRoot(element);
  root.render(createElement(ReactComponent, props ?? {}));
  return () => root.unmount();
});

<template>
  <div {{mountReact @reactComponent @props}}></div>
</template>
