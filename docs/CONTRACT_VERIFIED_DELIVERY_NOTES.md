# Contract Verified Delivery Notes

This pass tightens contract fulfillment so contracts cannot complete unless the promised goods were actually delivered.

## Implemented files

- `src/game/simulation.js`
- `src/components/ContractBoard.jsx`

## Problem corrected

Contract delivery previously selected any reserved stock lot attached to a contract ID.

That was too loose. It allowed the contract to behave as though generic reserved stock was enough, instead of verifying that the actual promised design/type/quantity had been delivered.

## New rule

A contract can only complete when its verified delivery manifest proves the promised goods were delivered.

A delivered lot must match:

- contract ID
- reserved contract stock status
- assigned promised design ID
- promised design type
- contract required type
- available quantity

## Contract acceptance changes

When a contract is accepted, it now locks in:

- `assignedDesignId`
- `promisedDesignName`
- `promisedDesignType`
- empty `deliveryManifest`
- `verifiedDeliveredQuantity: 0`

The event log now explicitly says which design has been promised.

## Contract production changes

Contract production now calculates remaining quantity from verified delivered quantity, not generic delivered quantity.

Reserved stock only counts toward production coverage if it matches the promised goods.

## Contract delivery changes

Delivery now:

1. finds only promised matching lots
2. blocks if only mismatched reserved stock exists
3. records a delivery manifest entry
4. recalculates verified delivered quantity from the manifest
5. completes the contract only if verified delivered quantity meets or exceeds the required quantity

## Deadline changes

Deadline failure penalties now use verified delivered quantity rather than loose delivered quantity.

## UI changes

The Contract Board now displays:

- promised design
- verified delivered quantity
- verified stock ready
- blocked stock warnings when reserved stock does not match the promise
- delivery manifest entry count

Buttons were renamed to reinforce intent:

- `Promise <design>`
- `Queue Promised Goods`
- `Deliver Verified Stock`

## Design intent

A contract is a promise to deliver a specific accepted design, not a generic quantity bucket. This gives contracts teeth and prevents accidental or exploitative completion using incorrect stock.

## Next useful step

Add contract inspection and rejection rules:

- client can reject defective stock on higher-skull contracts
- defective stock may count as partial delivery or trigger renegotiation
- late partial delivery may preserve some relationship value
- high-reputation clients may impose stricter QA verification before payout
