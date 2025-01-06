<script setup lang="ts">
import { type Theme } from './theme';
const { model } = defineProps<{ model: Theme }>();
</script>

<template>
  <div class="theme-view">
    <h2>theme</h2>

    <div class="theme-grid">

      <div class="theme-header">light</div>
      <div>r: {{ model.light.r }}</div>
      <ui-range :min="0" :max="255" v-model="model.light.r" />
      <div>g: {{ model.light.g }}</div>
      <ui-range :min="0" :max="255" v-model="model.light.g" />
      <div>r: {{ model.light.b }}</div>
      <ui-range :min="0" :max="255" v-model="model.light.b" />

      <div class="theme-header">dark</div>
      <div>r: {{ model.dark.r }}</div>
      <ui-range :min="0" :max="255" v-model="model.dark.r" />
      <div>g: {{ model.dark.g }}</div>
      <ui-range :min="0" :max="255" v-model="model.dark.g" />
      <div>r: {{ model.dark.b }}</div>
      <ui-range :min="0" :max="255" v-model="model.dark.b" />

    </div>

    <div class="flex row gap-2">
      <ui-button class="btn" @click="model.save()">save</ui-button>
      <ui-button class="btn" @click="model.load()">load</ui-button>
      <ui-button class="btn" @click="model.reset()">reset</ui-button>
    </div>
  </div>
</template>

<style lang="scss">
.theme-view {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  min-width: 20em;
}

.theme-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.theme-header {
  grid-column: 1 / -1;
}
</style>
