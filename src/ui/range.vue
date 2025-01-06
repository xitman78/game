<script setup lang="ts">
import { computed, ref } from 'vue';

import { useRange } from '@/lib/use';

const model = defineModel<number>({ required: true });

const props = withDefaults(defineProps<{
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}>(), {
  min: 0,
  max: 100,
  step: 1,
});

const outer = ref<HTMLElement>(undefined!);
const inner = ref<HTMLElement>(undefined!);

const { horizontal, percents } = useRange(outer, inner, model, props);
const orientation = computed(() => (horizontal.value ? 'horizontal' : 'vertical'));
const tab = computed(() => props.disabled ? -1 : 0);
</script>

<template>
  <div ref="outer" :class="['range', orientation]" :tabindex="tab">
    <div ref="inner" class="range-inner">
      <div :class="['range-axis', orientation]">
        <div :class="['range-track', orientation]" />
        <div
          :class="['range-fill', orientation]"
          :style="
            horizontal
              ? { width: `calc(${percents}% + 2 * var(--track-radius))` }
              : { height: `calc(${percents}% + 2 * var(--track-radius))` }
          "
        />
        <div
          :class="['range-thumb', orientation, { hidden: min === max }]"
          :style="horizontal ? { left: `${percents}%` } : { bottom: `${percents}%` }"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
$padding: 0.5em;
$thumb-size: 1em;
$track-radius: 2px;

.range {
  --track-radius: #{$track-radius};
  display: flex;
  user-select: none;
  &.horizontal {
    padding: 0 $padding;
  }
  &.vertical {
    padding: $padding 0;
  }
}

.range-inner {
  position: relative;
  flex-grow: 1;
}

.range-axis {
  position: absolute;
  &.horizontal {
    left: 0;
    top: 50%;
    right: 0;
  }
  &.vertical {
    left: 50%;
    top: 0;
    bottom: 0;
  }
}

.range-track {
  position: absolute;
  left: -$track-radius;
  top: -$track-radius;
  right: -$track-radius;
  bottom: -$track-radius;
  border-radius: $track-radius;
  box-shadow: 0 0 $track-radius black inset;
}

.range-fill {
  position: absolute;
  border-radius: $track-radius;
  background-color: rgb(var(--red) / 0.5);
  left: -$track-radius;
  bottom: -$track-radius;
  transition: background-color var(--fast);
  &.horizontal {
    top: -$track-radius;
  }
  &.vertical {
    right: -$track-radius;
  }
}

.range:hover .range-fill,
.range:focus-within .range-fill {
  background-color: rgb(var(--red));
}

.range-thumb {
  position: absolute;
  width: $thumb-size;
  height: $thumb-size;
  border-radius: 50vh;
  border: 2px solid rgb(var(--orange));
  filter: drop-shadow(0 0 3px rgb(var(--shadow)));
  &.horizontal {
    transform: translate(-50%, -50%);
  }
  &.vertical {
    transform: translate(-50%, 50%);
  }
}
</style>
