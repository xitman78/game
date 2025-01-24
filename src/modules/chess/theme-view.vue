<script setup lang="ts">
import { type Theme } from './theme';
import { watch } from 'vue';

const { model } = defineProps<{ model: Theme }>();
const emit = defineEmits(['close']);

// Watch all RGB values and save automatically when they change
watch(
  [
    () => model.light.r,
    () => model.light.g,
    () => model.light.b,
    () => model.dark.r,
    () => model.dark.g,
    () => model.dark.b,
  ],
  () => model.save(),
);
</script>

<template>
  <div class="theme-view">
    <div class="theme-header-row">
      <h5>Settings</h5>
    </div>
    <button class="close-button" @click="emit('close')">&times;</button>

    <div class="theme-grid">

      <div class="theme-header">Light cells:</div>
      <div>R: {{ model.light.r }}</div>
      <ui-range :min="0" :max="255" v-model="model.light.r" />
      <div>G: {{ model.light.g }}</div>
      <ui-range :min="0" :max="255" v-model="model.light.g" />
      <div>B: {{ model.light.b }}</div>
      <ui-range :min="0" :max="255" v-model="model.light.b" />
      <hr class="divider"/>
      <div class="theme-header">Dark cells:</div>
      <div>R: {{ model.dark.r }}</div>
      <ui-range :min="0" :max="255" v-model="model.dark.r" />
      <div>G: {{ model.dark.g }}</div>
      <ui-range :min="0" :max="255" v-model="model.dark.g" />
      <div>B: {{ model.dark.b }}</div>
      <ui-range :min="0" :max="255" v-model="model.dark.b" />

    </div>

    <div class="action-buttons">
      <ui-button class="btn" @click="model.reset()">Reset to default colors</ui-button>
    </div>
  </div>
</template>

<style lang="scss">
.theme-view {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  min-width: 20em;
  position: relative;
}

.theme-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 1rem;
  padding-top: 1rem;
}

.close-button {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1);
  color: #666;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s, color 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.2);
    color: #333;
  }
}

.theme-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 1rem;
  row-gap: 0.5rem;
}

.theme-header {
  grid-column: 1 / -1;
}

.divider {
  grid-column: 1 / -1;
  width: 100%;
  margin: 0.5rem 0;
  border: none;
  border-top: 1px solid rgb(var(--border));
}

.action-buttons {
  padding: 1rem;
  display: flex;
  gap: 1rem;
  justify-content: center
}
</style>
