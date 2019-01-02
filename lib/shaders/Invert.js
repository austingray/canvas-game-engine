/**
 * @author Augnar / 
 *
 * Mirror Shader
 * Copies half the input to the other half
 *
 * side: side of input to mirror (0 = left, 1 = right, 2 = top, 3 = bottom)
 */

THREE.InvertShader = {

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

      "vec4 color = texture2D(tDiffuse, vUv);",

      "gl_FragColor = vec4(1.0 - color.r, 1.0 - color.g, 1.0 - color.b, 0);",

    "}",

	].join( "\n" )

};
