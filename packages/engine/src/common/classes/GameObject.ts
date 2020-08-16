import { TransformComponent } from "../../transform/components/TransformComponent"
import { Entity } from "../../ecs/classes/Entity"
import { addComponentToEntity, removeComponentFromEntity } from "../../ecs/functions/EntityFunctions"
import { ComponentConstructor } from "../../ecs/classes/Component"

/**
 * GameObjects are the fundamental objects in Armada that represent characters,
 * props and scenery. They do not accomplish much in themselves but they act as
 * containers for Components.
 * A GameObject always has a Transform component attached (to represent position
 * and orientation) and it is not possible to remove this.
 */
export class GameObject extends Entity {
  constructor() {
    super()
    addComponentToEntity(this, TransformComponent)
  }

  removeComponent(component: ComponentConstructor<any>, forceImmediate?: boolean): this {
    if (component !== TransformComponent) {
      removeComponentFromEntity(this, component, forceImmediate)
    }
    return this
  }
}