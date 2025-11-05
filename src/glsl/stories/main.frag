
#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D   u_scene;
uniform sampler2D   u_sceneDepth;

uniform mat4        u_projectionMatrix;

uniform vec3        u_camera;
uniform float       u_cameraNearClip;
uniform float       u_cameraFarClip;

uniform vec3        u_light;
uniform vec3        u_lightColor;
uniform float       u_lightFalloff;
uniform float       u_lightIntensity;

uniform vec2        u_resolution;
uniform float       u_time;

varying vec2        v_texcoord;
varying vec4        v_position;
varying vec4        v_color;
varying vec3        v_normal;

#ifdef LIGHT_SHADOWMAP
uniform sampler2D   u_lightShadowMap;
uniform mat4        u_lightMatrix;
varying vec4        v_lightCoord;
#endif


#define RESOLUTION          u_resolution
#define CAMERA_POSITION     u_camera
#define SURFACE_POSITION    v_position

#define LIGHT_DIRECTION     u_light
#define LIGHT_COLOR         u_lightColor
#define LIGHT_FALLOFF       u_lightFalloff
#define LIGHT_INTENSITY     u_lightIntensity
#define LIGHT_COORD         v_lightCoord

#define CAMERA_NEAR_CLIP    u_cameraNearClip
#define CAMERA_FAR_CLIP     u_cameraFarClip

#include "../lygia/lighting/pbr.glsl"
#include "../lygia/sample.glsl"
#include "../lygia/space/linearizeDepth.glsl"

void main(void) {
    vec4 color = vec4(0.0, 0.0, 0.0, 1.0);
    vec2 pixel = 1.0/u_resolution;
    vec2 st = gl_FragCoord.xy * pixel;

    // Define focal point
    float focalDistance = 1.0;
    float focalRange = sin(u_time / 3.) * 10. + 25.;
    
    Material material = materialNew();

#if defined(POSTPROCESSING)
    float depth = SAMPLER_FNC(u_sceneDepth, st).r;
    depth = linearizeDepth(depth);
    
    depth = min( abs(depth  - focalDistance) / focalRange, 1.0);

    // Mix White Background and crisp scene images based on depth
    color.rgb = mix(vec3(1.), SAMPLER_FNC(u_scene, st).rgb, 1.0-depth);

    // Debug Depth
#ifdef DEBUG
    material.albedo.rgb = vec3(1.) * depth;
#endif
    #else
    color = pbr(material);
    color = linear2gamma(color);
    #endif

    gl_FragColor = color;
}
