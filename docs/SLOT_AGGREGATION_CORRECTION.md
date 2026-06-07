# Slot Aggregation Correction

This note corrects an implementation drift that overextended component-node contact logic into module and vehicle design.

## Correct Model

Component internals may use nodes, local placement, authored ports, contact quality, and interface compatibility. That logic is for component-level engineering only.

Modules do not need to connect directly to adjacent modules. A module is a packaged functional unit with category, footprint, cost, reliability, maintenance burden, power draw, heat output, mass, volume, efficiency, and other stat effects.

Vehicles do not need ordered module connection chains. A vehicle has a shaped slot map. Each slot or slot region defines which module categories can be installed there. The vehicle's final statistics are calculated from hull rules plus the aggregate effects of installed modules.

## Module Layer

Modules should care about:

- module category
- module footprint and shape
- valid slot type
- mass
- power draw or power generation
- heat output or heat handling
- reliability
- defect risk
- maintenance burden
- crew or automation impact
- cargo, thrust, armor, sensor, reactor, weapon, utility, or production effects
- install cost and manufacture cost

Modules should not require direct input/output chains to neighboring modules.

## Vehicle Layer

Vehicles should care about:

- hull layout template
- slot categories
- allowed module types per slot or region
- module footprint fit
- total mass
- power balance
- heat balance
- thrust balance
- cargo capacity
- armor or structure
- reliability and maintenance burden
- total cost and sale value
- invalid or overloaded slot usage

Vehicles should not require module-to-module routing or connection order.

## Implementation Direction

Retain component-node contacts as an internal component design concept.

Do not use pathfinding, routed wires, pipe routing, or connection chains for modules or vehicles.

Next implementation should add:

- module category definitions
- vehicle hull slot maps
- allowed module categories per slot region
- slotted module placement validation
- aggregate vehicle stat calculation
- UI that shows module slot fit and vehicle stat totals
