/**
 * @author Austin Gray / 
 *
 * InvertShader
 * Inverts the colors on the scene
 */

const InvertShader = {

	uniforms: {
		"tDiffuse": { value: null },
	},

	vertexShader: [

	  "varying vec2 vUv;",

		"void main() {",
      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
		"}"

	].join( "\n" ),

	fragmentShader: [

	"uniform sampler2D tDiffuse;",
	"varying vec2 vUv;",

	"void main() {",
    "vec4 color = texture2D( tDiffuse, vUv );",
		"vec3 c = color.rgb;",

	  "gl_FragColor = vec4(1.0 - c.r, 1.0 - c.g, 1.0 - c.b, 1);",
	"}",

	].join( "\n" )

};

export default InvertShader;
