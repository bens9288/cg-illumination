import { Scene } from '@babylonjs/core/scene';
import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera';
import { PointLight } from '@babylonjs/core/Lights/pointLight';
import { CreateSphere } from '@babylonjs/core/Meshes/Builders/sphereBuilder';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { RawTexture } from '@babylonjs/core/Materials/Textures/rawTexture';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { Vector2, Vector3 } from '@babylonjs/core/Maths/math.vector';
import { bakedVertexAnimation } from '@babylonjs/core/Shaders/ShadersInclude/bakedVertexAnimation';
import { CreateDisc, CreatePolyhedron, CreateRibbon, CreateTorusKnot, Mesh, VertexData } from '@babylonjs/core';

class Renderer {
    constructor(canvas, engine, material_callback, ground_mesh_callback) {
        this.canvas = canvas;
        this.engine = engine;
        this.scenes = [
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
        light0.diffuse = new Color3(1.0, 1.0, 1.0);
        light0.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light0);

        let light1 = new PointLight('light1', new Vector3(0.0, 3.0, 0.0), scene);
        light1.diffuse = new Color3(1.0, 1.0, 1.0);
        light1.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light1);

        // Create ground mesh
        let white_texture = RawTexture.CreateRGBTexture(new Uint8Array([255, 255, 255]), 1, 1, scene);
        let ground_heightmap = new Texture('/heightmaps/default.png', scene);
        ground_mesh.scaling = new Vector3(20.0, 1.0, 20.0);
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
        let sphere = CreateSphere('sphere', {segments: 32}, scene);
        sphere.position = new Vector3(1.0, 0.5, 3.0);
        sphere.metadata = {
            mat_color: new Color3(0.10, 0.35, 0.88),
            mat_texture: white_texture,
            mat_specular: new Color3(0.8, 0.8, 0.8),
            mat_shininess: 16,
            texture_scale: new Vector2(1.0, 1.0)
        }
        sphere.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(sphere);


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
        current_scene.camera = new UniversalCamera('camera', new Vector3(0.0, 1.8, 10.0), scene);
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
        let ground_heightmap = new Texture('/heightmaps/heightmap2.png', scene);
        ground_mesh.scaling = new Vector3(20.0, 1.0, 20.0);
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
        let custom_car = new Mesh("custom", scene);
        var positions = [-5, 2, -3, -7, -2, -3, -3, -2, -3, 5, 2, 3, 7, -2, 3, 3, -2, 3];
        var indices = [0, 1, 2, 3, 4, 5];

        var normals = [];
        custom_car.metadata = {
            mat_color: new Color3(0.10, 0.35, 0.88),
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
        vertexData.applyToMesh(custom_car, true);
        console.log(vertexData)

        custom_car.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(custom_car);
        
        // --------------------------------------------------
        


        let sphere = CreateSphere('sphere', {segments: 32}, scene);
        sphere.position = new Vector3(1.0, 0.5, 3.0);
        sphere.metadata = {
            mat_color: new Color3(0.10, 0.35, 0.88),
            mat_texture: white_texture,
            mat_specular: new Color3(0.8, 0.8, 0.8),
            mat_shininess: 16,
            texture_scale: new Vector2(1.0, 1.0)
        }
        sphere.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(sphere);

         let polygon = CreatePolyhedron('polygon', {type: 4}, scene);
         polygon.position = new Vector3(2.0, 1.5, 2.0);
         polygon.metadata = {
             mat_color: new Color3(0.50, 0.35, 0.88),
             mat_texture: white_texture,
             mat_specular: new Color3(0.3, 0.3, 0.3),
             mat_shininess: 30,
             texture_scale: new Vector2(1.0, 1.0)
         }
         polygon.material = materials['illum_' + this.shading_alg];
         current_scene.models.push(polygon);

         let shape = CreateTorusKnot('knot', {radius: 0.5}, scene);
         shape.position = new Vector3(1.0, 3.5, 2.0);
         shape.metadata = {
             mat_color: new Color3(0.20, 0.45, 0.48),
             mat_texture: white_texture,
             mat_specular: new Color3(0.3, 0.3, 0.3),
             mat_shininess: 30,
             texture_scale: new Vector2(1.0, 1.0)
         }
         shape.material = materials['illum_' + this.shading_alg];
         current_scene.models.push(shape);


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
            //current_scene.lights[this.active_light].position = new Vector3(10 * Math.sin(alpha), 0, 10 * Math.cos(alpha));
            //sphere.metadata.mat_color = new Color3(Math.cos(alpha+1.0)+1.5,Math.cos(alpha+4.0)+1.5, Math.cos(alpha+78.0)+1.5 );
            //alpha += 0.01;

            


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
