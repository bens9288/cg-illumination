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
    vec3 model_color = mat_color * texture(mat_texture, model_uv).rgb;
    
    vec3 ambientLight = model_color * ambient;
    
    FragColor = min(vec4(1.0, 1.0, 1.0, 1.0),
        // ambient = Ia * model_color
        vec4(ambientLight, 1.0)  
        // specular = Ip * model_color * dot(R V) ^ material_shiny
        + vec4(specular_illum * mat_specular, 1.0)
        // diffuse = Ip * model_color * dot(N L)
        + vec4(diffuse_illum *  model_color, 1.0)
        );

    
}
