<template>
  <div>
    <canvas ref="canvas" width="500" height="500" style="width:100%" @click="onCast"></canvas>
  </div>
</template>
<script setup lang="ts">
import { usePlatform } from '@/store';
import { computed, onMounted, ref, watch } from 'vue';
import { Platform } from '@/utils/platform'

const store = usePlatform();
const canvas = ref<HTMLCanvasElement>();
let platform:any;
function onCast(e:MouseEvent) {
  const x = ( e.clientX / window.innerWidth ) * 2 - 1;
	const y = - ( e.clientY / window.innerHeight ) * 2 + 1;
  platform.cast(x, y);
}
onMounted(() => {
  if(canvas.value) {
    platform = new Platform(canvas.value);
    const boothes = [
      {
        name: '慧拓',
        url: 'https://minio.trvqd.com/meta/waytous.glb',
        x: -5,
        y: 1,
        z: 1,
        degree: 0
      },
      {
        name: '慧拓',
        url: 'https://minio.trvqd.com/meta/waytous.glb',
        x: -5,
        y: 1,
        z: -50,
        degree: 90
      }
    ]
    platform.start(boothes);
  }
})
</script>
