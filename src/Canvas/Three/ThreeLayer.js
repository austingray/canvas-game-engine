import CanvasBaseClass from '../CanvasBaseClass';

class ThreeLayer extends CanvasBaseClass {
  /**
   * Creates a three.js scene
   * @param {*} args
   * @memberof Shadows
   */
  create(args) {
    // parse args
    this.domElement = args.domElement;

    // specify the vantage point of the scene lighting camera
    this.lightCameraZ = (typeof args.lightCameraZ !== 'undefined') ? args.lightCameraZ : 25;

    // create the scene, lights, plane
    this.init();
    this.createLights();
    this.createPlane();
  }

  init() {
    // init canvas
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera( this.width / - 2, this.width / 2, this.height / 2, this.height / - 2, 1, 5000 );
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      canvas: this.domElement,
      antialias: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // the default is THREE.PCFShadowMap

    // call the effect composer
    if (this.invert) {
      this.invertSceneColors();
    }

    // resize handling
    window.addEventListener( 'resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize( window.innerWidth, window.innerHeight );
    }, false );
  }

  /**
   * Create light sources
   *
   * @memberof Shadows
   */
  createLights() {
    this.light = new THREE.PointLight( 0xFFFFFF, 1, 0, 0.5 );
    this.light.castShadow = true;
    this.light.position.set( 0, 0, -this.lightCameraZ );      
    this.light.shadow.mapSize.width = 512;  // default
    this.light.shadow.mapSize.height = 512; // default
    this.light.shadow.camera.near = 0.5;       // default
    this.light.shadow.camera.far = this.width      // default

    this.scene.add(this.light);
  }

  /**
   * The surface that receives shadows
   *
   * @memberof Shadows
   */
  createPlane() {
    const material = new THREE.ShadowMaterial()
    const geometry = new THREE.BoxGeometry(this.width, this.height, 1);
    this.plane = new THREE.Mesh( geometry, material );

    this.scene.add(this.plane);
    this.plane.receiveShadow = true;
 }

  draw(Canvas) {
    const Camera = Canvas.Camera;
    
    // plane
    this.plane.position.x = 0;
    this.plane.position.y = 0;
    
    // light
    this.light.position.x = Camera.x + Camera.offsetX - Camera.width / 2 + 25;
    this.light.position.y = Camera.y + Camera.offsetY - Camera.height / 2 + 25;
    
    // camera
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = -5000;
    this.camera.rotation.z = 180 * Math.PI / 180;
    this.camera.rotation.y = 180 * Math.PI / 180;

    // avoid duplicate rendering with effect composer
    this.renderer.render(this.scene, this.camera);
    
    // update
    this.plane.material.needsUpdate = true;
  }
}

export default ThreeLayer;
