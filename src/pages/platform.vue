<template>
  <div class="model-loader">
    <div v-if="isLoading" class="msg">{{msg}}</div>
    <canvas ref="canvas" width="500" height="500" style="width:100%" @click="onCast"></canvas>
  </div>
</template>
<script setup lang="ts">
import { usePlatform } from '@/store';
import { computed, onMounted, ref, watch } from 'vue';
import { Platform, EVENT } from '@/utils/platform'
const props = defineProps({
  id: String
});
const store = usePlatform();
const canvas = ref<HTMLCanvasElement>();
let platform:any;
function onCast(e:MouseEvent) {
  const x = ( e.clientX / window.innerWidth ) * 2 - 1;
	const y = - ( e.clientY / window.innerHeight ) * 2 + 1;
  platform.cast(x, y);
}
const msg = ref('');
const isLoading = ref(false);
function onLoading (e:any) {
  isLoading.value = true;
  const { data } = e;
  const per = data.loaded / data.total;
  msg.value = `loading:${Math.floor(per * 1000) / 10}%`;
}
function onLoaded(e:Event) {
  isLoading.value = false;
}

onMounted(() => {
  if(canvas.value) {
    platform = new Platform(canvas.value);
    platform.addEventListener(EVENT.LOADING, onLoading);
    platform.addEventListener(EVENT.LOADED, onLoaded);
    platform.start(props.id);
  }
});
watch(() => props.id, (val, old) => {
  platform.start(val);
});
</script>

<style scoped lang="scss">
.model-loader {
  .msg {
    background-color: white;
    position: fixed;
  }
}

</style>