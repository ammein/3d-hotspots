
#ifdef GL_ES
precision mediump float;
#endif

uniform float               focalRange;

#define RESOLUTION          resolution
#define CAMERA_NEAR_CLIP    cameraNear
#define CAMERA_FAR_CLIP     cameraFar

#include "lygia/sampler.glsl"
#include "lygia/space/linearizeDepth.glsl"

void mainImage(const in vec4 inputColor, const in vec2 uv,
	const in float depthNum, out vec4 outputColor) {
    vec4 color = inputColor;
    vec2 st = uv;

    // Define focal point
    float focalDistance = 1.0;

    float depth = texture2D(depthBuffer, st).r;
    depth = linearizeDepth(depth);
    
    depth = min( abs(depth  - focalDistance) / focalRange, 1.0);

    // Mix White Background and crisp scene images based on depth
    color.rgb = mix(vec3(1.), texture2D(inputBuffer, st).rgb, 1.0-depth);

    // Debug Depth
    #ifdef DEBUG
        color.rgb = vec3(1.) * depth;
    #endif

    outputColor = color;
}