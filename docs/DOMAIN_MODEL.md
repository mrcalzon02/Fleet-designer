# Fleet Designer Domain Model

This document keeps the simulation language consistent as the project grows.

## Company

The player-controlled manufacturer.

Fields to implement:

- name
- cash
- reputation
- cycle
- market share by sector
- factory capacity
- warehouse capacity
- active licenses
- owned designs

## Engineer

Research and design labor unit.

Fields to implement:

- name
- specialization: propulsion, hull materials, electronics, life support, weapons, exotic systems, supply-chain engineering
- skill
- salary
- fatigue
- morale
- assigned project id

## Research Project

A technology-development effort that unlocks stats, capabilities, or efficiency modifiers.

Fields to implement:

- name
- discipline
- tier
- prerequisites
- progress
- required progress
- assigned engineer ids
- event table
- unlock payload

## Design

A proprietary technical object created or licensed by the company.

Shared fields:

- name
- type: component, module, vessel
- owner
- license status: private, sale good, license available, licensed from rival
- royalty rate
- production rights
- quality score
- reliability score
- manufacturing cost
- bill of materials

## Component Design

Circuit or subsystem-level item.

Stats:

- mass
- heat
- power draw
- efficiency
- durability
- complexity
- manufacturing cost

## Module Design

Grid-assembled subsystem made from components.

Stats:

- occupied grid cells
- required components
- heat dissipation
- structural rating
- maintenance rating
- output category

## Vessel Design

Hull-level product made from modules.

Stats:

- hull type
- module slots
- mission ratings: freight, exploration, combat, luxury, endurance, stealth
- crew requirements
- operating cost
- build cost

## Contract

A client demand signal.

Fields:

- client name
- category: raw supply, component order, technology development, module design, hull integration, full vessel build
- specs
- deadline cycle
- reward
- penalty
- reputation effect
- accepted state
- fulfillment state

## Supply Chain

Material flow and production dependency network.

Entities:

- supplier
- raw material
- refined material
- refinery job
- warehouse stock
- logistics route
- supply contract
- efficiency modifier

## Production Run

Factory work order.

Fields:

- design id
- quantity
- purpose: contract, market sale, private fleet, prototype
- progress
- required cycles
- material reservations
- defect risk
- priority

## Competitor

AI rival manufacturer.

Fields:

- name
- cash band
- specialties
- market sectors
- known designs
- pricing behavior
- bid aggression
- research focus
