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
uniform vec2 texture_scale;

// Output
out vec3 model_normal;
out vec2 model_uv;

void main() {
    // Get initial position of vertex (prior to height displacement)
    vec4 world_pos = world * vec4(position, 1.0);

    // Pass vertex normal onto the fragment shader
    float gray = ((texture(heightmap, uv)).r + (texture(heightmap, uv)).g + (texture(heightmap, uv)).b + (texture(heightmap, uv)).a)/4.0;
    //float gray = 0.3*(texture(heightmap, uv)).r + 0.59*(texture(heightmap, uv)).g + 0.3*(texture(heightmap, uv)).b;
    float d = 2.0 * height_scalar * (gray - 0.5);
    world_pos.y = world_pos.y + d;

    vec2 neighbor_1_uv = vec2(uv[0] + 0.001, uv[1]);
    float gray_1 = ((texture(heightmap, neighbor_1_uv)).r + (texture(heightmap, neighbor_1_uv)).g + (texture(heightmap, neighbor_1_uv)).b + (texture(heightmap, neighbor_1_uv)).a)/4.0;
    //float gray_1 = 0.3*texture(heightmap, neighbor_1_uv).r + 0.59*texture(heightmap, neighbor_1_uv).g + 0.3*texture(heightmap, neighbor_1_uv).b;
    float d_1 = 2.0 * height_scalar * (gray_1 - 0.5);
    vec4 neighbor_1 = vec4(world_pos.x + 0.001, d_1, world_pos.z, 1.0);

    vec2 neighbor_2_uv = vec2(uv[0], uv[1] + 0.001);
    float gray_2 = ((texture(heightmap, neighbor_2_uv)).r + (texture(heightmap, neighbor_2_uv)).g + (texture(heightmap, neighbor_2_uv)).b + (texture(heightmap, neighbor_2_uv)).a)/4.0;
    //float gray_2 = 0.3*texture(heightmap, neighbor_2_uv).r + 0.59*texture(heightmap, neighbor_2_uv).g + 0.3*texture(heightmap, neighbor_2_uv).b;
    float d_2 = 2.0 * height_scalar * (gray_2 - 0.5);
    vec4 neighbor_2 = vec4(world_pos.x, d_2, world_pos.z + 0.001, 1.0);


    vec3 tangent = neighbor_1.xyz - world_pos.xyz;
    vec3 bitangent = neighbor_2.xyz - world_pos.xyz;
    model_normal = normalize(cross(bitangent, tangent));


    
    // Pass vertex texcoord onto the fragment shader
    model_uv = uv;

    // Transform and project vertex from 3D world-space to 2D screen-space
    gl_Position = projection * view * world_pos;
}
