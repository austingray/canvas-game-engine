import InvertShader from './Shaders/InvertShader';

class Shadows {
  /**
   * Create core three.js items
   * @param {*} args
   * @memberof Shadows
   */
  constructor(args) {
    // parse args
    this.domElement = args.domElement;
    this.width = args.width;
    this.height = args.height;

    // specify the vantage point of the scene lighting camera
    this.cameraZ = (typeof args.cameraZ !== 'undefined') ? args.cameraZ : 25;

    // set this to true to invert the scene's colors
    this.invert = false;
    
    // create the scene, lights, plane
    this.init();
    this.createLights();

    // Use different material depending on if we are inverting the colors.
    // If we are inverting the colors we are using the scene as
    // an alpha map for a separate shadow layer.
    // If we are not then we are using the scene as a shadow layer.
    const material = this.invert
      ? new THREE.MeshPhongMaterial({
          color: 0xFFFFFF,
          opacity: 1,
          transparent: false,
          specular: new THREE.Color(0x000000),
          shininess: 0,
        })
      : new THREE.ShadowMaterial();
    this.createPlane(material);
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

  invertSceneColors() {
    // postprocessing
    this.composer = new THREE.EffectComposer(this.renderer);
    
    // add invert effect
    const invertEffect = new THREE.ShaderPass(InvertShader);
    invertEffect.renderToScreen = true;
    this.composer.addPass(invertEffect);

    // add renderer
    const renderPass = new THREE.RenderPass(this.scene, this.camera)
    this.composer.addPass(renderPass);
  }

  /**
   * Create light sources
   *
   * @memberof Shadows
   */
  createLights() {

    this.light = new THREE.PointLight( 0xFFFFFF, 1, 0, 0.5 );
    this.light.castShadow = true;
    this.light.position.set( 0, 0, -this.cameraZ );      
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
  createPlane(material) {
    const geometry = new THREE.BoxGeometry(this.width, this.height, 1);
    this.plane = new THREE.Mesh( geometry, material );

    this.scene.add(this.plane);
    this.plane.receiveShadow = true;
 }

  draw(Canvas) {
    const Camera = Canvas.Camera;
    
    // update the shadow receive plane position
    this.plane.position.x = 0;
    this.plane.position.y = 0;
    this.light.position.x = Camera.x + Camera.offsetX - Camera.width / 2 + 25;
    this.light.position.y = Camera.y + Camera.offsetY - Camera.height / 2 + 25;
    
    // update camera position
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = -5000;
    this.camera.rotation.z = 180 * Math.PI / 180;
    this.camera.rotation.y = 180 * Math.PI / 180;

    // avoid duplicate rendering with effect composer
    if (this.invert) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
    
    // update
    this.plane.material.needsUpdate = true;
  }
}

export default Shadows;
