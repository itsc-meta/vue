<template>
  <div class="platform">
    <div v-if="isLoading" class="msg">{{loadingMsg}}</div>
    <canvas ref="canvas" width="500" height="500" style="width:100%" @click="onCast"></canvas>
    <div class="dialog">
      <section class="dialog-content" :class="{fold}">
        <header>
          <h2>{{boothInfo.name}}</h2>
          <div class="fold-btn" @click.stop="toggle">
            <img v-if="fold" src="@/assets/images/unfold.png" />
            <img v-else src="@/assets/images/fold.png" />
          </div>
        </header>
        <article>
          <p>{{boothInfo.content}}</p>
        </article>
        <footer>
          <img class="operation" src="@/assets/images/website.png" />
          <img class="operation" src="@/assets/images/zoom.png" />
        </footer>
      </section>
      <div class="dialog-secretary">
        <img src="@/assets/images/secretary.png" height="400" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { usePlatform } from '@/store';
import { computed, onMounted, ref, watch } from 'vue';
const props = defineProps({
  id: String
});
const store = usePlatform();
const canvas = ref<HTMLCanvasElement>();
function onCast(e:MouseEvent) {
  const x = ( e.clientX / window.innerWidth ) * 2 - 1;
	const y = - ( e.clientY / window.innerHeight ) * 2 + 1;
  store.cast(x, y);
}
const isLoading = computed(() => store.isLoading);
const loadingMsg = computed(() => store.loadingMsg);
const boothInfo = computed(() => store.boothInfo);
const fold = computed(() => store.isFold);

function toggle() {
  store.toggleFold();
}

onMounted(() => {
  if(canvas.value) {
    store.freight(canvas.value); // 装载canvas
    store.start(props.id||''); // 按照config开始执行
  }
});
watch(() => props.id, (val, old) => {
  store.start(val||''); // config修改
});
</script>

<style scoped lang="scss">
.platform {
  .msg {
    background-color: white;
    position: fixed;
  }
  .dialog {
    position: fixed;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    &-content {
      max-width: 550px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border-radius: 1em;
      overflow: hidden;
      &.fold {
        header {
          height: 53px;
        }
        article {
          display: none;
        }
        footer {
          display: none;
        }
      }
      header {
        font-size: 25px;
        min-width: 200px;
        height: 47px;
        background-color: #2B7E58;
        text-align: center;
        position: relative;
        h2 {
          color: #FFFFFF;
          margin-block-start: 2px;
          margin-block-end: 0;
        }
        .fold-btn {
          position: absolute;
          right: 25px;
          top: 17px;
        }
      }
      article {
        padding: 25px;
        background-color: #FFFFFF;
        flex-grow: 1;
        p {
          font-size: 14px;
          margin-block-start: 0;
          margin-block-end: 0;
        }
      }
      footer {
        background-color: #FFFFFF;
        padding: 25px;
        text-align: center;
        .operation ~.operation {
          margin-left: 12px;
        }
      }
    }
  }
}

</style>