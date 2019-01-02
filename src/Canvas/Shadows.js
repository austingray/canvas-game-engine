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

    this.init();
    this.createLights();
    this.createPlane();

    // postprocessing
    this.composer = new THREE.EffectComposer( this.renderer );
    this.composer.addPass( new THREE.RenderPass( this.scene, this.camera ) );
    var invertEffect = new THREE.ShaderPass( THREE.InvertShader );
    invertEffect.renderToScreen = true;
    // this.composer.addPass(invertEffect);
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
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.shadowMap.enabled = true;
  }

  /**
   * Create light sources
   *
   * @memberof Shadows
   */
  createLights() {
    this.light = new THREE.PointLight( 0xFFFFFF, 5, 300, 0.5 );
    this.light.castShadow = true;
    this.light.position.set( 0, 0, -25 );
    this.scene.add(this.light);
    
    this.light.shadow.mapSize.width = 512;  // default
    this.light.shadow.mapSize.height = 512; // default
    this.light.shadow.camera.near = 0.5;       // default
    this.light.shadow.camera.far = this.width      // default
    // this.light.shadow.radius = 5;
  }

  /**
   * The surface that receives shadows
   *
   * @memberof Shadows
   */
  createPlane() {
    // create the plane that the shadows get cast to
    // const material = new THREE.MeshPhongMaterial({
    //   color: 0xFFFFFF,
    //   opacity: 1,
    //   transparent: true,
    //   specular: new THREE.Color(0x000000),
    //   shininess: 0,
    // });

    const material = new THREE.ShadowMaterial({});
    
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

    // render
    this.renderer.render(this.scene, this.camera);
    // this.composer.render();
    
    // update
    this.plane.material.needsUpdate = true;
  }
}

export default Shadows;
