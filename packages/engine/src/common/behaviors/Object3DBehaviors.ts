/** This Module contains function to perform different operations on 
 *    {@link https://threejs.org/docs/#api/en/core/Object3D | Object3D } from three.js library. 
 * @packageDocumentation
 * */

import { Color, Object3D } from "three";
import { Object3DComponent } from '../components/Object3DComponent';
import {
  AmbientLightProbeTagComponent,
  AmbientLightTagComponent,
  ArrayCameraTagComponent,
  AudioListenerTagComponent,
  AudioTagComponent,
  BoneTagComponent,
  CameraTagComponent,
  CubeCameraTagComponent,
  DirectionalLightTagComponent,
  GroupTagComponent,
  HemisphereLightProbeTagComponent,
  HemisphereLightTagComponent,
  ImmediateRenderObjectTagComponent,
  InstancedMeshTagComponent,
  LightProbeTagComponent,
  LightTagComponent,
  LineSegmentsTagComponent,
  LineTagComponent,
  LODTagComponent,
  MeshTagComponent,
  OrthographicCameraTagComponent,
  PerspectiveCameraTagComponent,
  PointLightTagComponent,
  PointsTagComponent,
  PositionalAudioTagComponent,
  RectAreaLightTagComponent,
  SceneTagComponent,
  SkinnedMeshTagComponent,
  SpotLightTagComponent,
  SpriteTagComponent
} from '../components/Object3DTagComponents';
import { Behavior } from '../interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { Component } from '../../ecs/classes/Component';
import { ComponentConstructor } from '../../ecs/interfaces/ComponentInterfaces';
import {
  hasComponent,
  getComponent,
  removeComponent,
  removeEntity
  , addComponent
} from '../../ecs/functions/EntityFunctions';
import { SkyboxComponent } from '../../scene/components/SkyboxComponent';
import { Engine } from '../../ecs/classes/Engine';

/**
 * Add Component into Entity from the Behavior.
 * @param entity Entity in which component will be added.
 * @param args Args contains Component and args of Component which will be added into the Entity.
 */
export function addComponentFromBehavior<C>(
  entity: Entity,
  args: {
    component: ComponentConstructor<Component<C>>
    objArgs: any
  }
): void {
  addComponent(entity, args.component, args.objArgs);
}

/**
 * Add Tag Component with into Entity from the Behavior.
 * @param entity Entity in which component will be added.
 * @param args Args contains Component which will be added into the Entity.
 */
export function addTagComponentFromBehavior<C>(
  entity: Entity,
  args: { component: ComponentConstructor<Component<C>> }
): void {
  // console.log("Adding ", args.component, " to ", entity);
  addComponent(entity, args.component);
}

/**
 * Add Object3D Component with args into Entity from the Behavior.
 */
export const addObject3DComponent: Behavior = (
  entity: Entity,
  args: { obj3d: any; objArgs?: any; parentEntity?: Entity }
) => {

  const isObject3d = typeof args.obj3d === 'object';
  let object3d;

  /**
   * apply value to sub object by path, like material.color = '#fff' will set { material:{ color }}
   * @param subj
   * @param path
   * @param value
   */
  const applyDeepValue = (subj: object, path: string, value: unknown): void => {
    // console.log('applyDeepValue', subj, path, value);
    if (!subj) {
      console.warn('subj is not an object', subj);
      return;
    }
    const groups = path.match(/(?<property>[^.]+)(\.(?<nextPath>.*))?/)?.groups;
    if (!groups) {
      return;
    }
    const { property, nextPath } = groups;

    if (!property || typeof subj[property] === 'undefined') {
      // console.warn('property not found', property);
      return;
    }
    if (nextPath) {
      return applyDeepValue(subj[property], nextPath, value);
    }

    if (subj[property] instanceof Color && (typeof value === "number" || typeof value === "string")) {
      subj[property] = new Color(value);
    } else {
      subj[property] = value;
    }
  };

  if (isObject3d) object3d = args.obj3d;
  else object3d = new args.obj3d();

  typeof args.objArgs === 'object' && Object.keys(args.objArgs).forEach(key => {
    applyDeepValue(object3d, key, args.objArgs[key]);
  });
  
  object3d.traverse((obj) => {
    // todo: add in shadow checks once we figure editor model settings
    // if((obj.receiveShadow || obj.castShadow) && (obj.type === 'Mesh' || obj.type === 'SkinnedMesh')) {
    if(obj.type === 'Mesh' || obj.type === 'SkinnedMesh') {
      obj.castShadow = true;
      // when we use lightmaps we don't want it to receive shadows from itself. this however stops other entity's shadows being cast on it
      if(!obj.material?.userData?.gltfExtensions?.MOZ_lightmap) {
        obj.receiveShadow = true;
        obj.material && Engine.csm?.setupMaterial(obj.material);
      }
    }
  });

  addComponent(entity, Object3DComponent, { value: object3d });
  // getMutableComponent<Object3DComponent>(entity, Object3DComponent).value = object3d;


  getComponentTags(object3d).forEach((component: any) => {
    addComponent(entity, component);
  });
  if (args.parentEntity && hasComponent(args.parentEntity, Object3DComponent as any)) {
    getComponent<Object3DComponent>(args.parentEntity, Object3DComponent).value.add(object3d);
  } else Engine.scene.add(object3d);
  object3d.entity = entity;
  return entity;
};

/**
 * Remove Object3D Component from the Entity.
 * @param entity Entity from which component will be removed.
 * @param unparent Whether to remove parent entity as well. Default is **```true```**.
 */
export function removeObject3DComponent(entity: Entity, unparent = true): void {
  const object3d = getComponent<Object3DComponent>(entity, Object3DComponent, true).value;
  if (object3d == undefined) return;
  Engine.scene.remove(object3d);

  if (unparent) {
    // Using "true" as the entity could be removed somewhere else
    object3d.parent && object3d.parent.remove(object3d);
  }
  removeComponent(entity, Object3DComponent);

  for (let i = entity.componentTypes.length - 1; i >= 0; i--) {
    const Component = entity.componentTypes[i];

    if (Component.isObject3DTagComponent) {
      removeComponent(entity, Component);
    }
  }

  (object3d as any).entity = null;
}

/**
 * Remove Entity and associated all Object3D Components.
 * @param entity Entity which will be removed.
 * @param forceImmediate Whether to remove Entity immediately or wait for frame to complete.
 */
export function remove(entity: Entity, forceImmediate: boolean): void {
  if (hasComponent<Object3DComponent>(entity, Object3DComponent)) {
    const obj = getObject3D(entity);
    obj.traverse(o => {
      if ((o as any).entity) removeEntity((o as any).entity, forceImmediate)
        ; (o as any).entity = null;
    });
    obj.parent && obj.parent.remove(obj);
  }
  removeEntity(entity, forceImmediate);
}

/**
 * Get Object3D from the given Entity.
 * @param entity Entity from which Object3D will be retrieved.
 * 
 * @returns Object3D retrieved from the Entity.
 */
export function getObject3D(entity: Entity): Object3D {
  const component = getComponent<Object3DComponent>(entity, Object3DComponent);
  return component && component.value;
}

/**
 * Get List of Component tags associated with given Object3D.
 * @param entity Object3D from which Component tags will be retrieved.
 * 
 * @returns List of Components tags of given Object3D.
 */
export function getComponentTags(object3d: Object3D): Array<Component<any>> {
  const components: Array<Component<any>> = [];
  if (object3d.type === 'Audio' && (object3d as any).panner !== undefined) {
    components.push(PositionalAudioTagComponent as any);
  }
  if (object3d.type === 'Audio' && (object3d as any).panner !== undefined) {
    components.push(PositionalAudioTagComponent as any);
  } else if (object3d.type === 'Audio') {
    components.push(AudioTagComponent as any);
  } else if (object3d.type === 'AudioListener') {
    components.push(AudioListenerTagComponent as any);
  } else if ((object3d as any).isCamera) {
    components.push(CameraTagComponent as any);

    if ((object3d as any).isOrthographicCamera) {
      components.push(OrthographicCameraTagComponent as any);
    } else if ((object3d as any).isPerspectiveCamera) {
      components.push(PerspectiveCameraTagComponent as any);
    }
    if ((object3d as any).isArrayCamera) {
      components.push(ArrayCameraTagComponent as any);
    } else if (object3d.type === 'CubeCamera') {
      components.push(CubeCameraTagComponent as any);
    } else if ((object3d as any).isImmediateRenderObject) {
      components.push(ImmediateRenderObjectTagComponent as any);
    }
  } else if ((object3d as any).isLight) {
    components.push(LightTagComponent as any);
    if ((object3d as any).isAmbientLight) {
      components.push(AmbientLightTagComponent as any);
    } else if ((object3d as any).isDirectionalLight) {
      components.push(DirectionalLightTagComponent as any);
    } else if ((object3d as any).isHemisphereLight) {
      components.push(HemisphereLightTagComponent as any);
    } else if ((object3d as any).isPointLight) {
      components.push(PointLightTagComponent as any);
    } else if ((object3d as any).isRectAreaLight) {
      components.push(RectAreaLightTagComponent as any);
    } else if ((object3d as any).isSpotLight) {
      components.push(SpotLightTagComponent as any);
    }
  } else if ((object3d as any).isLightProbe) {
    components.push(LightProbeTagComponent as any);
    if ((object3d as any).isAmbientLightProbe) {
      components.push(AmbientLightProbeTagComponent as any);
    } else if ((object3d as any).isHemisphereLightProbe) {
      components.push(HemisphereLightProbeTagComponent as any);
    }
  } else if ((object3d as any).isBone) {
    components.push(BoneTagComponent as any);
  } else if ((object3d as any).isGroup) {
    components.push(GroupTagComponent as any);
  } else if ((object3d as any).isLOD) {
    components.push(LODTagComponent as any);
  } else if ((object3d as any).isMesh) {
    components.push(MeshTagComponent as any);

    if ((object3d as any).isInstancedMesh) {
      components.push(InstancedMeshTagComponent as any);
    } else if ((object3d as any).isSkinnedMesh) {
      components.push(SkinnedMeshTagComponent as any);
    }
  } else if ((object3d as any).isLine) {
    components.push(LineTagComponent as any);

    if ((object3d as any).isLineLoop) {
      components.push(HemisphereLightProbeTagComponent as any);
    } else if ((object3d as any).isLineSegments) {
      components.push(LineSegmentsTagComponent as any);
    }
  } else if ((object3d as any).isPoints) {
    components.push(PointsTagComponent as any);
  } else if ((object3d as any).isSprite) {
    components.push(SpriteTagComponent as any);
  } else if ((object3d as any).isScene) {
    components.push(SceneTagComponent as any);
  } else if ((object3d as any).isSky) {
    components.push(SkyboxComponent as any);
  }
  return components;
}
