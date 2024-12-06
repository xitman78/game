<script setup lang="ts">
import { computed, ref } from 'vue';

const model = defineModel<any>();

const props = defineProps<{
  toggle?: undefined | '' | [any] | [any, any];
  noFocus?: undefined | '';
}>();

const emit = defineEmits<{
  click: [Event];
}>();

const root = ref<HTMLElement>(undefined!);

const checked = computed(() => {
  if (props.toggle === undefined) {
    return undefined;
  }
  else {
    if (props.toggle === '') {
      return model.value ? 'checked' : undefined;
    }
    else {
      return model.value === props.toggle[0] ? 'checked' : undefined;
    }
  }
});

function click(e: Event) {
  if (props.toggle === undefined) {
    emit('click', e);
  }
  else if (props.toggle === '') {
    model.value = !model.value;
  }
  else if (props.toggle.length === 1) {
    if (model.value !== props.toggle[0]) {
      model.value = props.toggle[0];
    }
  }
  else if (props.toggle.length === 2) {
    model.value = model.value === props.toggle[0] ? props.toggle[1] : props.toggle[0];
  }
}

function focus(e: FocusEvent) {
  if (props.noFocus !== undefined) {
    e.preventDefault();
    root.value.blur();
    (e.relatedTarget as HTMLElement)?.focus?.();
  }
}
</script>

<template>
  <button
    ref="root"
    :checked="checked"
    @pointerdown.stop
    @click="click"
    @focus="focus"
  >
    <slot v-bind="{ checked }" />
  </button>
</template>

<style lang="scss">
// TODO: organize, move
.btn {
  font-size: 13px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5em;
  background: rgb(var(--btn-bg) / 0.0625);
  border: 1px solid transparent;
  border-radius: var(--radius-small);
  user-select: none;
  padding-inline: 0.75em;
  transition:
    background-color var(--fast),
    border-color var(--fast),
    color var(--fast);
}

.btn[disabled] {
  opacity: 0.5;
  pointer-events: none;
}

.btn:focus {
  border-color: rgb(var(--btn-bg) / 0.25);
}

.btn[checked] {
  background-color: rgb(var(--btn-bg) / 0.125);
}

.btn:hover:not([checked]) {
  background-color: rgb(var(--btn-bg) / 0.125);
}

.btn:hover[checked] {
  background-color: rgb(var(--btn-bg) / 0.25);
}

.btn:active:hover {
  background-color: rgb(var(--btn-bg) / 0.375);
}

.btn.round {
  border-radius: 50vh;
}

.btn.iconic {
  width: 1.75rem;
  height: 1.75rem;
  padding: unset;
}

.btn.iconic:hover {
  font-size: 1.25em;
}

.btn.iconic:active:hover {
  font-size: 1.125em;
}

.cbx {
  height: 2.25em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5em;
  background: rgb(var(--btn-bg) / 0.0625);
  border: 1px solid transparent;
  border-radius: var(--radius-small);
  user-select: none;
  padding-inline: 0.75em;
  transition:
    background-color var(--fast),
    border-color var(--fast),
    color var(--fast);
}

.cbx[disabled] {
  opacity: 0.5;
  pointer-events: none;
}

.cbx:focus {
  border-color: rgb(var(--btn-bg) / 0.25);
}

.cbx[checked] {
  background-color: rgb(var(--btn-bg) / 0.125);
}

.cbx:hover:not([checked]) {
  background-color: rgb(var(--btn-bg) / 0.125);
}

.cbx:hover[checked] {
  background-color: rgb(var(--btn-bg) / 0.25);
}

.cbx:active:hover {
  background-color: rgb(var(--btn-bg) / 0.375);
}

.cbx.round {
  border-radius: 50vh;
}

.cbx-frame {
  display: flex;
  align-items: center;
  padding: 1px;
  border: 1px solid rgb(var(--btn-bg) / 0.25);
  border-radius: var(--radius-small);
  box-shadow: var(--shadow-control-inset);
}

.radio {
  height: 2.25em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5em;
  background: rgb(var(--btn-bg) / 0.0625);
  border: 1px solid transparent;
  border-radius: var(--radius-small);
  user-select: none;
  padding-inline: 0.75em;
  transition:
    background-color var(--fast),
    border-color var(--fast),
    color var(--fast);
}

.radio[disabled] {
  opacity: 0.5;
  pointer-events: none;
}

.radio:focus {
  border-color: rgb(var(--btn-bg) / 0.25);
}

.radio[checked] {
  background-color: rgb(var(--btn-bg) / 0.125);
}

.radio:hover:not([checked]) {
  background-color: rgb(var(--btn-bg) / 0.125);
}

.radio:hover[checked] {
  background-color: rgb(var(--btn-bg) / 0.25);
}

.radio:active:hover {
  background-color: rgb(var(--btn-bg) / 0.375);
}

.radio.round {
  border-radius: 50vh;
}

.radio-frame {
  display: flex;
  align-items: center;
  padding: 1px;
  border: 1px solid rgb(var(--btn-bg) / 0.3);
  border-radius: 50vh;
  box-shadow: var(--shadow-control-inset);
}

.flat {
  height: 1.25em;
  min-width: 1.25em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5em;
  background-color: rgb(var(--btn-bg) / 0);
  border-radius: var(--radius-small);
  user-select: none;
  transition:
    background-color var(--fast),
    border-color var(--fast),
    color var(--fast);
}

.flat[disabled] {
  opacity: 0.5;
  pointer-events: none;
}

.flat:focus {
  background-color: rgb(var(--btn-bg) / 0.0625);
}

.flat:hover {
  background-color: rgb(var(--btn-bg) / 0.125);
}

.flat:active:hover {
  background-color: rgb(var(--btn-bg) / 0.25);
}

.flat.round {
  border-radius: 50vh;
}

.flat.iconic {
  width: 1.75rem;
  height: 1.75rem;
  font-size: 1em;
  padding: unset;
}

.flat.iconic:hover {
  font-size: 1.25em;
}

.flat.iconic:active:hover {
  font-size: 1.125em;
}
</style>
