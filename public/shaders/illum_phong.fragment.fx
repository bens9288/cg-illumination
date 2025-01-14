#version 300 es
precision mediump float;

// Input
in vec3 model_normal;
in vec2 model_uv;

// Uniforms
// material
uniform vec3 mat_color;
uniform vec3 mat_specular;
uniform float mat_shininess;
uniform sampler2D mat_texture;
// camera
uniform vec3 camera_position;
// lights
uniform vec3 ambient; // Ia
uniform int num_lights;
uniform vec3 light_positions[8];
uniform vec3 light_colors[8]; // Ip

// Output
out vec4 FragColor;

void main() {
    // Color
   
    // normalized surface normal
    vec3 N = normalize(model_normal);
    
    // for each light
    vec4 diffuse_total = vec4(0.0, 0.0, 0.0, 0.0);
    vec4 specular_total = vec4(0.0, 0.0, 0.0, 0.0);
    for(int i = 0; i < num_lights; i++) {
        // normalized light direction
        vec3 L = normalize(light_positions[i]);
        // normalized reflected light direction
        vec3 R = normalize(2.0 * dot(N, L) * N - L);
        // normalized view direction
        vec3 V = normalize(camera_position);

        // specular
        specular_total = specular_total + vec4(light_colors[i] * mat_specular * pow(max(dot(R, V), 0.0), mat_shininess), 1.0);
        // diffuse
        diffuse_total = diffuse_total + vec4(light_colors[i] * mat_color*texture(mat_texture, model_uv).rgb * max(dot(N, L), 0.0), 1.0);
    }

    FragColor = min(vec4(1.0, 1.0, 1.0, 1.0),
        // ambient
        vec4(ambient * mat_color*texture(mat_texture, model_uv).rgb, 1.0) 
        // specular
        + specular_total
        // diffuse
        + diffuse_total
        );

}
