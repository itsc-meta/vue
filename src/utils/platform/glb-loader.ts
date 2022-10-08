import { Object3D, Raycaster, AnimationMixer, Mesh, Matrix4, Ray, FrontSide, BackSide, MeshBasicMaterial, VideoTexture, BoxGeometry, Texture, TextureLoader, Vector3 } from "three";
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
  _model:Object3D|undefined = undefined; // 模型
  _video:HTMLVideoElement|undefined = undefined;
  _image:string|undefined = undefined;
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
    this.add(
      new Mesh(
        new BoxGeometry(4,4,4).translate(0,2,0),
        new MeshBasicMaterial({color:0xff0000, wireframe:true})
      )
    );
  }
  /**
   * 加载
   * @param gltf glb模型
   */
  onLoad = (gltf:any) => {
    this.clear();
    const model = gltf.scene;
    this._model = model;
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
        if(this._image && object.material.name === 'fengmian') {
          object.material.map = new TextureLoader().load(this._image);
          object.material.needsUpdate = true;
        }
      }
    });
    this.add(model);
    const event = { type: LOAD_EVENT.LOADED, data: gltf };
    this.dispatchEvent(event);  
  };
  setImage(url:string) {
    this._image = url;
  }
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
  getInfo() {
    return this._booth;
  }
  /**
   * 获取摄像机位置
   */
  getCemeraPosition():Vector3 {
    const v = this._model ? this._model.localToWorld(new Vector3(0, 20, 20)) : new Vector3(0,20,20);
    return v;
  }
  /**
   * 重置
   */
  pause = () => {
    if(this._video && !this._video.paused) {
      this._video.pause();
      console.log(2, this._video.paused);
    }
  }
  play = () => {
    if(this._video) {
      this._video.play();
      console.log(1, this._video.paused);
    }
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
        if(ray.intersectsBox(mesh.geometry.boundingBox)) {
          arr.push(this);
          return;
        }
      }
    });
  };
}