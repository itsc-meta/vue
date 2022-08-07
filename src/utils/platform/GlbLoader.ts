import { Object3D, Raycaster, AnimationMixer, Mesh, Matrix4, Ray, FrontSide, BackSide, MeshBasicMaterial, VideoTexture } from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { IModel } from "@/type/base";

export const LOAD_EVENT = {
  LOADING: 'modelLoading',
  ANIMATION: 'modelAnimation',
  LOADED: 'modelLoaded',
  LOAD_FAIL: 'modelLoadFail'
};
export class GlbLoader extends Object3D {
  _loader:GLTFLoader; //加载器
  _booth:any; // 展位信息
  _video:HTMLVideoElement|undefined = undefined;
  constructor(booth:IModel) {
    super();
    this._booth = booth;
    const dracoLoader =new DRACOLoader();
    this._loader = new GLTFLoader();
    dracoLoader.setDecoderPath('./gltfdraco/');
    dracoLoader.setDecoderConfig({ type:'js'});
    dracoLoader.preload();
    this._loader.setDRACOLoader(dracoLoader);
    this._loader.load(booth.url, this.onLoad, this.onLoading, this.onLoadErrer);
  }
  /**
   * 加载
   * @param gltf glb模型
   */
  onLoad = (gltf:any) => {
    const model = gltf.scene;
    const animations = gltf.animations;
    if(animations.length > 0) {
      const mixer = new AnimationMixer( model );
      animations.forEach((animation:any) => {
        mixer.clipAction( animation ).play();        
      });
      this.dispatchEvent({ type: LOAD_EVENT.ANIMATION, data: mixer });
    }
    // model.name = '3dfield';
    model.traverse( ( object:any ) => {
      if ( object.isMesh ) {
        object.castShadow = true;
        object.receiveShadow = true;
        object.material.side = FrontSide;
        if(object.name === 'ping_mu001') {
          this._video = document.createElement('video');
          this._video.crossOrigin = 'anonymous';
          this._video.src = 'https://minio.trvqd.com/meta/itsc2022.mp4';
          const texture = new VideoTexture( this._video );
          const material = new MeshBasicMaterial( { map: texture } );
          object.material = material;
        }
      }
      if ( object.isLight ) {
        object.visible = false;
        // object.castShadow = true;
      }
    });
    this.add(model);
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
   * 获取详情
   */
  getContent() {
    return this._booth.content;
  }
  /**
   * 射线碰撞
   * @param ray 摄像头射线
   * @param arr 碰撞内容
   */
  raycast = (raycaster:Raycaster, arr:any) => {
    // if(ray.ray.distanceToPoint(this.position) < 3){
    //   arr.push(this);
    // }
    const matrix = new Matrix4()
    matrix.copy(this.matrixWorld).invert();
    const ray = new Ray();
    ray.copy(raycaster.ray).applyMatrix4(matrix);
    this.traverse( ( object ) => {
      const mesh:Mesh = object as Mesh;
      if ( mesh.isMesh && mesh.geometry.boundingBox) {
        // console.log(mesh)
        if(ray.intersectsBox(mesh.geometry.boundingBox)) {
          arr.push(this);
          return;
        }
      }
    });
    if(this._video) {
      this._video.play();
    }
  };
}