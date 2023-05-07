#version 300 es
precision mediump float;

// Input
in vec2 model_uv;
in vec3 diffuse_illum;
in vec3 specular_illum;

// Uniforms
// material
uniform vec3 mat_color;
uniform vec3 mat_specular;
uniform sampler2D mat_texture;
// light from environment
uniform vec3 ambient; // Ia

// Output
out vec4 FragColor;


void main() {

    //ambient: fragment shader, I Ka


    // vec3 N = normalize(model_normal);
    // normalized light direction
    // vec3 L = normalize(light_positions[0]);
    // // normalized reflected light direction
    // vec3 R = normalize(2.0 * dot(N, L) * N - L);
    // // // normalized view direction
    // vec3 V = normalize(camera_position);


    vec3 model_color = vec3(mat_color * texture(mat_texture, model_uv).rgb);

    //fragment determines ambient and some parts of diffuse
    //fragColor * Ia 
    vec3 ambientLight = model_color * ambient;
    
    FragColor = min(vec4(1.0, 1.0, 1.0, 1.0),
        // ambient = Ia * model_color
        vec4(ambientLight, 1.0)  
        // specular = Ip * model_color * dot(R V) ^ material_shiny
        + vec4(specular_illum * mat_specular, 1.0)
        // diffuse = Ip * model_color * dot(N L)
        + vec4(diffuse_illum *  model_color, 1.0)
        );

    // gl_Position = projection * view * world * vec4(position, 1.0);

}
