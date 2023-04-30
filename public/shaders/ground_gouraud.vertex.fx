#version 300 es
precision highp float;

// Attributes
in vec3 position;
in vec2 uv;

// Uniforms
// projection 3D to 2D
uniform mat4 world;
uniform mat4 view;
uniform mat4 projection;
// height displacement
uniform vec2 ground_size;
uniform float height_scalar;
uniform sampler2D heightmap;
// material
uniform float mat_shininess;
uniform vec2 texture_scale;
// camera
uniform vec3 camera_position;
// lights
uniform int num_lights;
uniform vec3 light_positions[8];
uniform vec3 light_colors[8]; // Ip

// Output
out vec2 model_uv;
out vec3 diffuse_illum;
out vec3 specular_illum;

void main() {
    // Get initial position of vertex (prior to height displacement)
    vec4 world_pos = world * vec4(position, 1.0);

    // Pass diffuse and specular illumination onto the fragment shader
    diffuse_illum = vec3(0.0, 0.0, 0.0);
    specular_illum = vec3(0.0, 0.0, 0.0);

    // Pass vertex normal onto the fragment shader
    float gray = texture(heightmap, uv).r;
    float d = 2.0 * height_scalar * (gray - 0.5);
    float og_world_y = world_pos.y;
    world_pos.y = world_pos.y + d;

    vec2 neighbor_1_uv = vec2(uv[0] + 0.001, uv[1]);
    float gray_1 = texture(heightmap, neighbor_1_uv).r;
    float d_1 = 2.0 * height_scalar * (gray_1 - 0.5);
    vec4 neighbor_1 = vec4(world_pos.x + 0.001*ground_size.x, og_world_y + d_1, world_pos.z, 1.0);

    vec2 neighbor_2_uv = vec2(uv[0], uv[1] + 0.001);
    float gray_2 = texture(heightmap, neighbor_2_uv).r;
    float d_2 = 2.0 * height_scalar * (gray_2 - 0.5);
    vec4 neighbor_2 = vec4(world_pos.x, og_world_y + d_2, world_pos.z + 0.001*ground_size.y, 1.0);


    vec3 tangent = neighbor_1.xyz - world_pos.xyz;
    vec3 bitangent = neighbor_2.xyz - world_pos.xyz;

    vec3 N = normalize(cross(bitangent, tangent)); // surface normal for ground
    vec3 L = normalize(light_positions[0]);     //light normal
    vec3 R = normalize(2.0 * dot(N, L) * N - L);    //reflected light normal
    vec3 V = normalize(camera_position);        //camera view

    // Pass vertex texcoord onto the fragment shader
    // model_uv = uv * texture_scale;
    model_uv = uv;
    
    diffuse_illum = vec3(light_colors[0]  * max(dot(N, L), 0.0));
    
    specular_illum = vec3(light_colors[0]  * pow(max(dot(R, V), 0.0), mat_shininess));

    // Pass vertex texcoord onto the fragment shader
    model_uv = uv;

    // Transform and project vertex from 3D world-space to 2D screen-space
    gl_Position = projection * view * world_pos;
}
