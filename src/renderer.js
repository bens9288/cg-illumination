import { Scene } from '@babylonjs/core/scene';
import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera';
import { PointLight } from '@babylonjs/core/Lights/pointLight';
import { CreateSphere } from '@babylonjs/core/Meshes/Builders/sphereBuilder';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { RawTexture } from '@babylonjs/core/Materials/Textures/rawTexture';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { Vector2, Vector3 } from '@babylonjs/core/Maths/math.vector';
import { bakedVertexAnimation } from '@babylonjs/core/Shaders/ShadersInclude/bakedVertexAnimation';
import { CreateBox, CreateCapsule, CreateCylinder, CreateDisc, CreateLathe, CreatePolyhedron, CreateRibbon, CreateTorus, CreateTorusKnot, Mesh, VertexData } from '@babylonjs/core';

class Renderer {
    constructor(canvas, engine, material_callback, ground_mesh_callback) {
        this.canvas = canvas;
        this.engine = engine;
        this.scenes = [
            {
                scene: new Scene(this.engine),
                background_color: new Color4(0.1, 0.1, 0.2, 1.0),
                materials: null,
                ground_subdivisions: [100, 100],
                ground_mesh: null,
                camera: null,
                ambient: new Color3(0.2, 0.2, 0.2),
                lights: [],
                models: []
            }, 
            {
                scene: new Scene(this.engine),
                background_color: new Color4(0.1, 0.1, 0.1, 1.0),
                materials: null,
                ground_subdivisions: [500, 500],
                ground_mesh: null,
                camera: null,
                ambient: new Color3(0.2, 0.2, 0.2),
                lights: [],
                models: []
            }
        ];
        this.active_scene = 0;
        this.active_light = 0;
        this.shading_alg = 'gouraud';

        this.scenes.forEach((scene, idx) => {
            scene.materials = material_callback(scene.scene);
            scene.ground_mesh = ground_mesh_callback(scene.scene, scene.ground_subdivisions);
            this['createScene'+ idx](idx);
        });
    }

    createScene0(scene_idx) {
        let current_scene = this.scenes[scene_idx];
        let scene = current_scene.scene;
        let materials = current_scene.materials;
        let ground_mesh = current_scene.ground_mesh;

        // Set scene-wide / environment values
        scene.clearColor = current_scene.background_color;
        scene.ambientColor = current_scene.ambient;
        scene.useRightHandedSystem = true;

        // Create camera
        current_scene.camera = new UniversalCamera('camera', new Vector3(0.0, 1.8, 10.0), scene);
        current_scene.camera.setTarget(new Vector3(0.0, 1.8, 0.0));
        current_scene.camera.upVector = new Vector3(0.0, 1.0, 0.0);
        current_scene.camera.attachControl(this.canvas, true);
        current_scene.camera.fov = 35.0 * (Math.PI / 180);
        current_scene.camera.minZ = 0.1;
        current_scene.camera.maxZ = 100.0;

        // Create point light sources
        let light0 = new PointLight('light0', new Vector3(1.0, 1.0, 5.0), scene);
        light0.diffuse = new Color3(0.0, 0.5, 1.0);
        light0.specular = new Color3(0.0, 0.5, 1.0);
        current_scene.lights.push(light0);

        let light1 = new PointLight('light1', new Vector3(0.0, 3.0, 0.0), scene);
        light1.diffuse = new Color3(1.0, 1.0, 1.0);
        light1.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light1);

        // Create ground mesh
        let white_texture = RawTexture.CreateRGBTexture(new Uint8Array([255, 255, 255]), 1, 1, scene);
        let ground_heightmap = new Texture('/heightmaps/volcano.png', scene);
        ground_mesh.scaling = new Vector3(20.0, 1.0, 20.0);
        ground_mesh.metadata = {
            mat_color: new Color3(0.10, 0.15, 0.65),
            mat_texture: white_texture,
            mat_specular: new Color3(0.0, 0.0, 0.0),
            mat_shininess: 1,
            texture_scale: new Vector2(1.0, 1.0),
            height_scalar: 1.0,
            heightmap: ground_heightmap
        }
        ground_mesh.material = materials['ground_' + this.shading_alg];

        // // Create other models
        let sphere = CreateSphere('sphere', {segments: 16}, scene);
        sphere.position = new Vector3(0.1, 0.2, 2.0);
        sphere.metadata = {
            mat_color: new Color3(0.10, 0.1, 0.1),
            mat_texture: white_texture,
            mat_specular: new Color3(0.8, 0.8, 0.8),
            mat_shininess: 16,
            texture_scale: new Vector2(1.0, 1.0)
        }
        sphere.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(sphere);

        let sphere2 = CreateSphere('sphere', {segments: 16}, scene);
        sphere2.position = new Vector3(-2.0, 0.2, 0.0);
        sphere2.metadata = {
            mat_color: new Color3(0.2, 0.1, 0.1),
            mat_texture: white_texture,
            mat_specular: new Color3(0.8, 0.8, 0.8),
            mat_shininess: 16,
            texture_scale: new Vector2(1.0, 1.0)
        }
        sphere.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(sphere2);

        let custom_fish = new Mesh("custom", scene);
        var positions = [
                         1,2,1, 2,3,1, 1,2,2, //0,1,2,
                         1,2,1, 2,3,1, 1,2,0, //3, 4, 5
                         1,2,2, 2,3,1, 5,2,1, //6, 7, 8
                         1,2,0, 2,3,1, 5,2,1, //9, 10, 11
                         1,2,1, 2,1,1, 1,2,2, //12, 13, 14
                         1,2,1, 2,1,1, 1,2,0, //15, 16, 17
                         1,2,2, 2,1,1, 5,2,1, //18, 19, 20
                         1,2,0, 2,1,1, 5,2,1, //21, 22, 23
                         5,2,1, 6,3,1, 8,3,1, //24,25,26
                         5,2,1, 6,1,1, 8,1,1, //27,28,29
                         2,2,2, 3,1,2, 4,1,2, //30,31,32
                         2,2,0, 3,1,0, 4,1,0, //33,34,35
                         2,3,1, 3,3.5,1, 4.5,2,1, //36,37,38
                        ]  
        var indices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
                        24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38];

        var normals = [];
        custom_fish.metadata = {
            mat_color: new Color3(0.88, 0.35, 0.18),
            mat_texture: white_texture,
            mat_specular: new Color3(0.8, 0.8, 0.8),
            mat_shininess: 16,
            texture_scale: new Vector2(1.0, 1.0)
        }

        VertexData.ComputeNormals(positions, indices, normals);
        var vertexData = new VertexData();
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.normals = normals;
        vertexData.applyToMesh(custom_fish, true);
        console.log(vertexData)

        custom_fish.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(custom_fish);


        // Selected light to be translated when using the keyboard
        scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.event.key) {
                case 'a': 
                    current_scene.lights[this.active_light].position = new Vector3(current_scene.lights[this.active_light].position.x - 1, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z);
                    break;
                case 'd': 
                    current_scene.lights[this.active_light].position = new Vector3(current_scene.lights[this.active_light].position.x + 1, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z);                    
                    break;
                case 'f': 
                    current_scene.lights[this.active_light].position = new Vector3(current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y - 1, current_scene.lights[this.active_light].position.z);
                    break;
                case 'r': 
                    current_scene.lights[this.active_light].position = new Vector3(current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y + 1, current_scene.lights[this.active_light].position.z);
                    break;
                case 'w': 
                    current_scene.lights[this.active_light].position = new Vector3(current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z - 1);
                    break;
                case 's': 
                    current_scene.lights[this.active_light].position = new Vector3(current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z + 1);
                    break;
            }  
        });

       
        var alpha = 0;
        // Animation function - called before each frame gets rendered
        scene.onBeforeRenderObservable.add(() => {
            // update models and lights here (if needed)
            // ...
            

            // update uniforms in shader programs
            this.updateShaderUniforms(scene_idx, materials['illum_' + this.shading_alg]);
            this.updateShaderUniforms(scene_idx, materials['ground_' + this.shading_alg]);
        });
    } 
    createScene1(scene_idx) {
        let current_scene = this.scenes[scene_idx];
        let scene = current_scene.scene;
        let materials = current_scene.materials;
        let ground_mesh = current_scene.ground_mesh;

        // Set scene-wide / environment values
        scene.clearColor = current_scene.background_color;
        scene.ambientColor = current_scene.ambient;
        scene.useRightHandedSystem = true;

        // Create camera
        current_scene.camera = new UniversalCamera('camera', new Vector3(0.0, 1.8, 25.0), scene);
        current_scene.camera.setTarget(new Vector3(0.0, 1.8, 0.0));
        current_scene.camera.upVector = new Vector3(0.0, 1.0, 0.0);
        current_scene.camera.attachControl(this.canvas, true);
        current_scene.camera.fov = 35.0 * (Math.PI / 180);
        current_scene.camera.minZ = 0.1;
        current_scene.camera.maxZ = 100.0;

        // Create point light sources
        let light0 = new PointLight('light0', new Vector3(1.0, 1.0, 5.0), scene);
        light0.diffuse = new Color3(1.0, 1.0, 1.0);
        light0.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light0);

        // Create ground mesh
        let white_texture = RawTexture.CreateRGBTexture(new Uint8Array([255, 255, 255]), 1, 1, scene);
        let ground_heightmap = new Texture('/heightmaps/default.png', scene);
        ground_mesh.scaling = new Vector3(0.0, 0.0, 0.0);
        ground_mesh.metadata = {
            mat_color: new Color3(0.10, 0.65, 0.15),
            mat_texture: white_texture,
            mat_specular: new Color3(0.0, 0.0, 0.0),
            mat_shininess: 1,
            texture_scale: new Vector2(1.0, 1.0),
            height_scalar: 1.0,
            heightmap: ground_heightmap
        }
        ground_mesh.material = materials['ground_' + this.shading_alg];

        // Create other models

        // CREATE CUSTOM MODEL TYPE -------------------------------------------------
        let custom = new Mesh("custom", scene);
        var positions = [

            0.0, 0.0, 1.0,      // center of star front
            0.0, 0.0, -1.0,     // center of star back

            1.0, 1.0, 0.0,     // top segment
            0.0, 3.0, 0.0, 
            -1.0, 1.0, 0.0,  

            3.0, 1.0, 0.0,      // left segment
            1.62, -0.9, 0.0,

            -3.0, 1.0, 0.0,     // right segment
            -1.62, -0.9, 0.0,

            0, -2.08, 0.0,      // bottm point
            
            -1.62, -2.98, 0.0,   // bottom left

            1.62, -2.98, 0.0   // bottom right
        ];

        var indices = [
            0, 4, 3,
            0, 3, 2,
   
            0, 2, 5,
            0, 5, 6,

            0, 6, 11,
            0, 11, 9,

            0, 9, 10,
            0, 10, 8, 

            0, 8, 7, 
            0, 7, 4, 


            1, 3, 4,
            1, 2, 3,
   
            1, 5, 2,
            1, 6, 5,

            1, 11, 6,
            1, 9, 11,

            1, 10, 9,
            1, 8, 10, 

            1, 7, 8, 
            1, 4, 7, 
        ];

        var normals = [];
        custom.metadata = {
            mat_color: new Color3(0.40, 0.35, 0.88),
            mat_texture: white_texture,
            mat_specular: new Color3(0.8, 0.8, 0.8),
            mat_shininess: 12,
            texture_scale: new Vector2(1.0, 1.0)
        }

        var vertexData = new VertexData();

        VertexData.ComputeNormals(positions, indices, normals, {useRightHandedSystem: false});
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.normals = normals;
        vertexData.applyToMesh(custom, true);
        custom.convertToFlatShadedMesh();

        custom.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(custom);
        
        // --------------------------------------------------
        

        let sphere_texture = new Texture("https://assets.babylonjs.com/textures/lava/lavatile.jpg", scene);
        let sphere = CreateSphere('sphere', {segments: 32}, scene);
        sphere.position = new Vector3(1.0, 1.0, 5.0);
        sphere.metadata = {
            mat_color: new Color3(0.10, 0.35, 0.88),
            mat_texture: sphere_texture,
            mat_specular: new Color3(0.8, 0.8, 0.8),
            mat_shininess: 16,
            texture_scale: new Vector2(1.0, 1.0)
        }
        sphere.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(sphere);

        let saturn_texture = new Texture("https://assets.babylonjs.com/textures/rock.png", scene);
        let saturn_like = CreateSphere('sphere', {diameter: 2.25}, scene);
        saturn_like.position = new Vector3(7.5, 5.0, 2.0);
        saturn_like.metadata = {
            mat_color: new Color3(0.95, 0.05, 0.08),
            mat_texture: saturn_texture,
            mat_specular: new Color3(0.3, 0.3, 0.3),
            mat_shininess: 30,
            texture_scale: new Vector2(1.0, 1.0)
        }
        saturn_like.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(saturn_like);


        let ring = CreateTorus('disc', {diameter: 3.0, thickness: 0.15}, scene);
        ring.position = new Vector3(7.5, 5.0, 2.0);
        ring.metadata = {
            mat_color: new Color3(0.95, 0.05, 0.08),
            mat_texture: saturn_texture,
            mat_specular: new Color3(0.3, 0.3, 0.3),
            mat_shininess: 30,
            texture_scale: new Vector2(1.0, 1.0)
        }
        ring.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(ring);

        // Selected light to be translated when using the keyboard
        scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.event.key) {
                case 'a': 
                    current_scene.lights[this.active_light].position = new Vector3(current_scene.lights[this.active_light].position.x - 1, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z);
                    break;
                case 'd': 
                    current_scene.lights[this.active_light].position = new Vector3(current_scene.lights[this.active_light].position.x + 1, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z);                    
                    break;
                case 'f': 
                    current_scene.lights[this.active_light].position = new Vector3(current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y - 1, current_scene.lights[this.active_light].position.z);
                    break;
                case 'r': 
                    current_scene.lights[this.active_light].position = new Vector3(current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y + 1, current_scene.lights[this.active_light].position.z);
                    break;
                case 'w': 
                    current_scene.lights[this.active_light].position = new Vector3(current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z - 1);
                    break;
                case 's': 
                    current_scene.lights[this.active_light].position = new Vector3(current_scene.lights[this.active_light].position.x, current_scene.lights[this.active_light].position.y, current_scene.lights[this.active_light].position.z + 1);
                    break;
            }  
        });

       
        var alpha = 0;
        // Animation function - called before each frame gets rendered
        scene.onBeforeRenderObservable.add(() => {
            // update models and lights here (if needed)
            // ...
            

            //moving lights and changing color
            current_scene.lights[this.active_light].position = new Vector3(10 * Math.sin(alpha), 0, 10 * Math.cos(alpha));
            sphere.metadata.mat_color = new Color3(Math.cos(alpha+1.0)+1.5,Math.cos(alpha+4.0)+1.5, Math.cos(alpha+78.0)+1.5 );
            sphere.position = new Vector3(7.5+ 12 * Math.sin(alpha+4)/2.5, 5, 12 * Math.cos(alpha+4)/2.5);
            alpha += 0.002;

            


            // update uniforms in shader programs
            this.updateShaderUniforms(scene_idx, materials['illum_' + this.shading_alg]);
            this.updateShaderUniforms(scene_idx, materials['ground_' + this.shading_alg]);
        });
    }

    updateShaderUniforms(scene_idx, shader) {
        let current_scene = this.scenes[scene_idx];
        shader.setVector3('camera_position', current_scene.camera.position);
        shader.setColor3('ambient', current_scene.scene.ambientColor);
        shader.setInt('num_lights', current_scene.lights.length);
        let light_positions = [];
        let light_colors = [];
        current_scene.lights.forEach((light) => {
            light_positions.push(light.position.x, light.position.y, light.position.z);
            light_colors.push(light.diffuse);
        });
        shader.setArray3('light_positions', light_positions);
        shader.setColor3Array('light_colors', light_colors);
    }

    getActiveScene() {
        return this.scenes[this.active_scene].scene;
    }
    
    setActiveScene(idx) {
        this.active_scene = idx;
    }

    setShadingAlgorithm(algorithm) {
        this.shading_alg = algorithm;

        this.scenes.forEach((scene) => {
            let materials = scene.materials;
            let ground_mesh = scene.ground_mesh;

            ground_mesh.material = materials['ground_' + this.shading_alg];
            scene.models.forEach((model) => {
                model.material = materials['illum_' + this.shading_alg];
            });
        });
    }

    setHeightScale(scale) {
        this.scenes.forEach((scene) => {
            let ground_mesh = scene.ground_mesh;
            ground_mesh.metadata.height_scalar = scale;
        });
    }

    setActiveLight(idx) {
        console.log(idx);
        this.active_light = idx;
    }
}

export { Renderer }
