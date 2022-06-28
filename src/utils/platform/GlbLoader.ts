import { Group, Raycaster } from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

export const LOAD_EVENT = {
  LOADING: 'modelLoading',
  LOADED: 'modelLoaded',
  LOAD_FAIL: 'modelLoadFail'
};
export class GlbLoader extends Group {
  _loader:GLTFLoader;
  constructor(url:string) {
    super();
    const dracoLoader =new DRACOLoader();
    this._loader = new GLTFLoader();
    dracoLoader.setDecoderPath('./gltfdraco/');
    dracoLoader.setDecoderConfig({ type:'js'});
    dracoLoader.preload();
    this._loader.setDRACOLoader(dracoLoader);
    this._loader.load(url, this.onLoad, this.onLoading, this.onLoadErrer);
  }
  /**
   * 加载
   * @param gltf glb模型
   */
  onLoad = (gltf:any) => {
    gltf.scene.name = '3dfield';
    this.add(gltf.scene);
    const event = { type: LOAD_EVENT.LOADED, data: gltf };
    this.dispatchEvent(event);  
  };
  /**
   * 加载中
   * @param e 加载过程事件
   * @returns 
   */
  onLoading = (e:ProgressEvent) => {
    const event = { type: LOAD_EVENT.LOADING, data: e };
    this.dispatchEvent(event);
  };
  /**
   * 加载错误
   * @param e 错误事件
   * @returns 
   */
  onLoadErrer = (e:ErrorEvent) => {
    const event = { type: LOAD_EVENT.LOAD_FAIL, data: e };
    this.dispatchEvent(event);
  };
  /**
   * 射线碰撞
   * @param ray 摄像头射线
   * @param arr 碰撞内容
   */
  raycast = (ray:Raycaster, arr:any) => {
    if(ray.ray.distanceToPoint(this.position) < 3){
      arr.push(this);
    }
    // console.log(ray.ray.distanceToPoint(this.position));
  };
}