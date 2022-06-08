import {
	Euler,
	EventDispatcher,
	MathUtils,
	Quaternion,
	Vector3
} from 'three';

const _zee = new Vector3( 0, 0, 1 );
const _euler = new Euler();
const _q0 = new Quaternion();
const _q1 = new Quaternion( - Math.sqrt( 0.5 ), 0, 0, Math.sqrt( 0.5 ) ); // - PI/2 around the x-axis

const _changeEvent = { type: 'change' };

const stepwise = (rota:number) => {
	const deg = MathUtils.radToDeg(rota);
	// console.log(deg);
	if(Math.abs( deg % 90 ) < 10) {
		console.log(deg);
		// rota = Math.round(deg / 90) * Math.PI/2;
	}
	return rota;
}

class DeviceOrientationControls extends EventDispatcher {
	object;
	enabled;
	deviceOrientation;
	screenOrientation;
	alphaOffset;
	connect;
	disconnect;
	update;
	dispose;
	constructor( object:any ) {
		super();
		if ( window.isSecureContext === false ) {
			console.error( 'THREE.DeviceOrientationControls: DeviceOrientationEvent is only available in secure contexts (https)' );
		}
		const scope = this;

		const EPS = 0.000001;
		const lastQuaternion = new Quaternion();

		this.object = object;
		this.object.rotation.reorder( 'YXZ' );

		this.enabled = true;

		this.deviceOrientation = {};
		this.screenOrientation = 0;

		this.alphaOffset = 0; // radians

		const onDeviceOrientationChangeEvent = function ( event:any ) {

			scope.deviceOrientation = event;

			scope.update();

		};

		const onScreenOrientationChangeEvent = function () {

			scope.screenOrientation = window.orientation || 0;

		};

		// The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

		const setObjectQuaternion = function ( quaternion:any, alpha:number, beta:number, gamma:number, orient:any ) {

			_euler.set( beta, alpha, - gamma, 'YXZ' ); // 'ZXY' for the device, but 'YXZ' for us

			quaternion.setFromEuler( _euler ); // orient the device

			quaternion.multiply( _q1 ); // camera looks out the back of the device, not the top

			quaternion.multiply( _q0.setFromAxisAngle( _zee, - orient ) ); // adjust for screen orientation

		};

		this.connect = function () {

			onScreenOrientationChangeEvent(); // run once on load

			// iOS 13+

			if ( window.DeviceOrientationEvent !== undefined && typeof window.DeviceOrientationEvent.requestPermission === 'function' ) {

				window.DeviceOrientationEvent.requestPermission().then( function ( response:any ) {

					if ( response == 'granted' ) {

						window.addEventListener( 'orientationchange', onScreenOrientationChangeEvent );
						window.addEventListener( 'deviceorientation', onDeviceOrientationChangeEvent );

					}

				} ).catch( function ( error:any ) {

					console.error( 'THREE.DeviceOrientationControls: Unable to use DeviceOrientation API:', error );

				} );

			} else {

				window.addEventListener( 'orientationchange', onScreenOrientationChangeEvent );
				window.addEventListener( 'deviceorientation', onDeviceOrientationChangeEvent );

			}

			scope.enabled = true;

		};

		this.disconnect = function () {

			window.removeEventListener( 'orientationchange', onScreenOrientationChangeEvent );
			window.removeEventListener( 'deviceorientation', onDeviceOrientationChangeEvent );

			scope.enabled = false;

		};

		this.update = function () {

			if ( scope.enabled === false ) return;

			const device:any = scope.deviceOrientation;

			if ( device ) {

				const alpha = device.alpha ? MathUtils.degToRad( device.alpha ) + scope.alphaOffset : 0; // Z

				const beta = device.beta ? MathUtils.degToRad( device.beta ) : 0; // X'

				const gamma = device.gamma ? MathUtils.degToRad( device.gamma ) : 0; // Y''

				const orient = scope.screenOrientation ? MathUtils.degToRad( scope.screenOrientation ) : 0; // O

				const quaternion = new Quaternion();
				setObjectQuaternion( quaternion, alpha, beta, gamma, orient );
				// if(Math.abs(quaternion.angleTo(_q0)) < 0.5) {
				// 	quaternion.set(_q0.x, _q0.y, _q0.z, _q0.w);
				// }
				scope.object.quaternion.rotateTowards(quaternion, 0.02);
				// console.log(scope.object.quaternion, scope.object.rotation);
				// setObjectQuaternion( scope.object.quaternion, alpha, beta, gamma, orient );
				// console.log(lastQuaternion, scope.object.quaternion);

				if ( 8 * ( 1 - lastQuaternion.dot( scope.object.quaternion ) ) > EPS ) {

					lastQuaternion.copy( scope.object.quaternion );
					scope.dispatchEvent( _changeEvent );

				}

			}

		};

		this.dispose = function () {

			scope.disconnect();

		};

		this.connect();

	}

}

export { DeviceOrientationControls };