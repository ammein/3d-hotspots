
#ifdef GL_ES
precision mediump float;
#endif

uniform mat4 u_modelViewProjectionMatrix;
uniform mat4 u_projectionMatrix;
uniform mat4 u_modelMatrix;
uniform mat4 u_viewMatrix;
uniform mat3 u_normalMatrix;

varying vec4 v_position;
varying vec4 v_color;
varying vec3 v_normal;
varying vec2 v_texcoord;
varying vec4 v_tangent;
varying mat3 v_tangentToWorld;
varying vec4 v_lightCoord;

#ifdef PLATFORM_WEBGL

// ThreeJS
#define POSITION_ATTRIBUTE  vec4(position,1.0)
#define TANGENT_ATTRIBUTE   tangent
#define COLOR_ATTRIBUTE     color
#define NORMAL_ATTRIBUTE    normal
#define TEXCOORD_ATTRIBUTE  uv
#define CAMERA_UP           vec3(0.0, -1.0, 0.0)
#define MODEL_MATRIX        modelMatrix
#define VIEW_MATRIX         viewMatrix
#define PROJECTION_MATRIX   projectionMatrix

#ifdef LIGHT_SHADOWMAP
uniform mat4 u_lightMatrix;
#endif

#else 

#define POSITION_ATTRIBUTE  a_position
attribute vec4 POSITION_ATTRIBUTE;

#ifdef MODEL_VERTEX_COLOR
#define COLOR_ATTRIBUTE     a_color
attribute vec4 COLOR_ATTRIBUTE;
#endif

#ifdef MODEL_VERTEX_NORMAL
#define NORMAL_ATTRIBUTE    a_normal
attribute vec3 NORMAL_ATTRIBUTE;
#endif

#ifdef MODEL_VERTEX_TEXCOORD
#define TEXCOORD_ATTRIBUTE  a_texcoord
attribute vec2 TEXCOORD_ATTRIBUTE;
#endif

#ifdef MODEL_VERTEX_TANGENT
#define TANGENT_ATTRIBUTE   a_tangent
attribute vec4 TANGENT_ATTRIBUTE;
#endif

#ifdef LIGHT_SHADOWMAP
uniform mat4 u_lightMatrix;
#endif

#define CAMERA_UP           vec3(0.0, 1.0, 0.0)
#define MODEL_MATRIX        u_modelMatrix
#define VIEW_MATRIX         u_viewMatrix
#define PROJECTION_MATRIX   u_projectionMatrix

#endif

void main(void) {

#ifdef PLATFORM_WEBGL
    v_position = POSITION_ATTRIBUTE;
#else
    v_position = MODEL_MATRIX * POSITION_ATTRIBUTE;
#endif

#if defined(USE_COLOR) || defined(MODEL_VERTEX_COLOR)
    v_color = COLOR_ATTRIBUTE;
#endif

#if defined(PLATFORM_WEBGL) || defined(MODEL_VERTEX_NORMAL)
    v_normal = NORMAL_ATTRIBUTE;
#else
    v_normal = vec4(MODEL_MATRIX * vec4(NORMAL_ATTRIBUTE, 0.0)).xyz;
#endif

#if defined(MODEL_VERTEX_TEXCOORD)
    v_texcoord = TEXCOORD_ATTRIBUTE;
#elif defined(PLATFORM_WEBGL)
    v_texcoord = POSITION_ATTRIBUTE.xy * 0.5 + 0.5;
#endif

#ifdef MODEL_VERTEX_TANGENT
    v_tangent = TANGENT_ATTRIBUTE;
    vec3 worldTangent = TANGENT_ATTRIBUTE.xyz;
    vec3 worldBiTangent = cross(v_normal, worldTangent);// * sign(TANGENT_ATTRIBUTE.w);
    v_tangentToWorld = mat3(normalize(worldTangent), normalize(worldBiTangent), normalize(v_normal));
#endif

#ifdef LIGHT_SHADOWMAP
    v_lightCoord = u_lightMatrix * v_position;
#endif

    gl_Position = PROJECTION_MATRIX * VIEW_MATRIX * MODEL_MATRIX * v_position;
}