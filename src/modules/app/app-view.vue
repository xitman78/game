<script setup lang="ts">
import { type App } from './app';

const { model } = defineProps<{ model: App }>();
</script>

<template>
  <div class="flex col gap-1em">
    <h1>Workin</h1>
    <div class="flex row gap-1em">
      <ui-button class="btn" @click="model.reset()">reset</ui-button>
    </div>
    <board-view :model="model.board" />
  </div>
</template>

<style lang="scss">
#app {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gap-1em {
  gap: 1em;
}

.board-input {
  border: 1px solid rgb(var(--border));
  border-radius: 0.25em;
  padding-inline: 0.5em;
  width: 3em;
}

:root {
  --dark: 64 16 16;
  --light: 128 128 128;
}

.dark {
  fill: rgb(var(--dark));
}
.light {
  fill: rgb(var(--light));
}
</style>
