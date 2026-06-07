# Financing, Banking, Loans, and Equity Notes

This document captures future development notes for emergency financing, banking, debt, stock options, dilution, and ownership control.

## Design Goal

The player should not instantly lose the moment cash turns negative. A company in trouble should be able to seek financing, but every rescue should create a strategic scar.

Debt rescues the company from insolvency but adds fixed repayment pressure.

Equity rescues the company from insolvency but permanently reduces the player's share of future profits and control.

The intended theme is not free money. It is survival capital with consequences.

## Banking and Loan System

### Purpose

Loans give the player a way to survive cash collapse, recover from failed contracts, bridge production costs, or fund a major expansion before revenue arrives.

The loan system should become available through a Banking / Finance panel.

### Loan Offer Fields

Each loan offer should define:

- lender name
- principal amount
- interest rate
- repayment term in cycles
- per-cycle payment
- origination fee
- collateral requirement
- approval chance or approval gate
- reputation requirement
- company valuation requirement
- penalty for missed payments
- whether it is secured or unsecured
- whether default can trigger forced asset sale or bankruptcy

### Loan Types

Possible loan types:

- Emergency Insolvency Bridge
- Working Capital Loan
- Factory Expansion Loan
- Inventory Financing
- Contract Fulfillment Advance
- Equipment Lease
- High-Risk Private Credit
- Predatory Last-Chance Note

### Emergency Insolvency Bridge

This should appear when the company is near bankruptcy or has just entered insolvency warning status.

It should provide quick cash, but at ugly terms:

- higher interest
- shorter repayment term
- strict missed-payment penalty
- possible reputation damage
- possible forced lender oversight
- possible restriction on dividends or stock buybacks

### Approval Logic

Loan approval should depend on:

- global company reputation
- source/client reputation
- current cash
- current debt load
- company valuation
- production backlog
- accepted contracts
- recent failures
- difficulty setting

Banks should prefer stable companies with predictable revenue.

Predatory lenders should target desperate companies with bad terms.

### Loan Repayment

Loan repayment should occur automatically during cycle advancement before discretionary spending.

If the player cannot pay:

1. mark the loan delinquent
2. charge penalty interest or late fee
3. damage bank reputation
4. possibly restrict further borrowing
5. after repeated misses, trigger default consequences

### Default Consequences

Default consequences may include:

- lender reputation collapse
- forced asset sale
- forced inventory liquidation
- inability to accept certain contracts
- higher future interest rates
- investor confidence loss
- emergency restructuring event
- bankruptcy if unrecoverable

### UI Requirements

The Banking panel should show:

- current cash
- current operating burn
- total debt
- per-cycle debt service
- active loans
- available loan offers
- projected runway
- insolvency warning
- default warning
- approve/accept loan buttons
- repayment schedule

## Company Valuation System

Loans and stock sales need a company valuation model.

### Suggested Valuation Formula

Company valuation should be based on:

- cash reserves
- owned designs
- active production capacity
- warehouse inventory value
- accepted contract backlog
- completed relationship reputation
- source reputation
- technology unlocks
- active debt penalty
- recent failure penalty
- difficulty pressure

Valuation should move over time.

Strong companies should receive better financing options. Weak companies should sell equity cheaply and borrow expensively.

### Valuation Volatility

Valuation should not be perfectly stable.

It may fluctuate with:

- market pressure
- rival activity
- contract failures
- source reputation shifts
- bankruptcy scares
- completed high-skull contracts
- major tech unlocks
- successful vessel design releases

## Stock Options / Equity System

### Core Ownership Model

The player starts with 100% company ownership by default.

Ownership should be represented as 5000 total equity blocks.

- 5000 / 5000 blocks owned = 100% ownership
- selling 100 blocks = selling 2% of the company
- selling 500 blocks = selling 10% of the company
- selling 2500 blocks = selling 50% of the company

Equity sales should happen in blocks of 100.

### Profit Share Consequence

If the player sells equity, they permanently lose the same percentage of future distributed profits.

Example:

- player sells 500 of 5000 blocks
- player now owns 90%
- 10% of future profits are paid to outside shareholders

This should not necessarily reduce gross revenue, but it should reduce retained profit after payout/distribution.

### Ownership and Control

Ownership should eventually affect control.

Suggested control thresholds:

- 100% ownership: full private control
- 75%+ ownership: majority control, minimal interference
- 51%+ ownership: majority control, but investor pressure appears
- 50% or less: loss of secure majority control
- below 35%: board pressure and forced strategic objectives
- below 20%: founders may be reduced to operator role

Initial implementation can keep control simple and only reduce retained profit.

Later implementation can add board pressure, investor mandates, and hostile takeover risk.

### Equity Offering Fields

Each equity offering should define:

- number of blocks sold
- price per block
- total cash raised
- ownership percentage sold
- new player ownership percentage
- investor type
- investor pressure level
- profit share obligation
- valuation used for pricing
- whether the offering is emergency discounted

### Stock Block Pricing

Block price should be based on company valuation.

Formula:

- total company valuation / 5000 = base block value
- investor demand modifies price
- desperation discount modifies price
- reputation modifies price
- recent failure modifies price
- high debt reduces price

If the company is desperate, stock should sell at a discount.

If the company is strong, stock should sell at a premium.

### Stock Value Movement

Sold stock blocks should have a changing market value.

The market value of each block should rise or fall with company valuation.

This enables later systems:

- buybacks
- investor pressure
- hostile accumulation
- employee stock options
- public/private valuation tracking
- founder control risk

### Stock Buybacks

Future feature:

The player should eventually be able to buy back stock blocks if they have cash.

Buybacks should be expensive when the company is successful and cheaper when the company is damaged.

Buying back stock should increase ownership percentage and reduce outside profit share.

### Emergency Equity Raise

When cash is low, the company can sell equity quickly.

Emergency equity should:

- raise cash immediately
- sell at a discount
- increase outside ownership
- reduce future retained profits
- potentially trigger investor oversight

This should be the equity equivalent of a predatory emergency loan.

## Profit Distribution Model

The company should distinguish between:

- gross revenue
- operating costs
- debt service
- net profit
- retained earnings
- shareholder distribution

Outside shareholders should only take from profit, not from gross revenue.

However, if the game keeps a simpler model, the first version can apply an outside-shareholder drain during cycle advancement when cash flow is positive.

### Simple First Version

If player ownership is 90%, then 10% of positive net cycle profit is paid out to outside shareholders.

If the company loses money that cycle, no outside profit share is paid.

### Advanced Version

Later, the board/investors may demand payouts even when the company would rather retain cash.

## Financing Panel UI

A future Finance panel should include:

- Banking tab
- Equity tab
- Valuation tab
- Debt schedule
- Ownership meter
- investor pressure meter
- available loan offers
- available stock sale blocks
- cash runway estimate
- insolvency warning

### Banking Tab

Shows:

- active loans
- lender
- balance
- interest
- payment per cycle
- remaining term
- delinquency status
- available new loan offers

### Equity Tab

Shows:

- total blocks: 5000
- player-owned blocks
- outside-owned blocks
- player ownership percent
- outside profit share percent
- current block price
- current company valuation
- buttons to sell stock in blocks of 100
- future buyback controls

### Valuation Tab

Shows valuation components:

- cash
- designs
- inventory
- contracts
- technology
- reputation
- source relationships
- debt penalty
- recent failure penalty
- rival pressure discount

## Integration Points

### Cycle Advancement

Cycle advancement should process:

1. operating burn
2. loan payments
3. delinquency/default checks
4. production and warehouse costs
5. revenue
6. profit-share payout if profitable
7. valuation update

### Bankruptcy / Insolvency

Bankruptcy should become a process, not instant death.

Possible states:

- operating
- cash warning
- insolvent warning
- emergency finance available
- delinquent
- restructuring
- bankrupt

Loans and equity offers should appear during warning and emergency states.

### Difficulty Scaling

Difficulty should affect:

- loan interest rates
- approval chance
- emergency financing harshness
- investor discount demand
- valuation volatility
- number of available financing offers
- severity of default consequences

### Rival Interaction

Future rival finance behavior:

- rivals can raise capital
- rivals can become overleveraged
- rivals can be investor-backed
- rivals can be acquired or merged
- rivals can suffer debt collapse
- rivals can buy stock if company goes public or sells too much equity

## First Implementation Recommendation

The first live implementation should be narrow:

1. Add company ownership fields:
   - `totalEquityBlocks: 5000`
   - `playerEquityBlocks: 5000`
   - `outsideEquityBlocks: 0`
   - `outsideProfitShare: 0`
2. Add company valuation calculation helper.
3. Add active loan list and loan offer list.
4. Add Finance panel with Banking and Equity sections.
5. Add simple loan acceptance and automatic repayment.
6. Add sell-equity action in blocks of 100.
7. Apply outside shareholder profit share only when cycle cash flow is positive.

Do not add hostile takeovers, board control, buybacks, or complex defaults in the first implementation pass.

## Design Warning

This system should be dangerous but useful.

If loans are too forgiving, bankruptcy stops mattering.

If equity is too forgiving, ownership stops mattering.

If both are too punishing, players will never use them.

The intended tension is simple:

- loans preserve ownership but create fixed survival pressure
- equity reduces pressure but permanently sells part of the future
- emergency financing saves the company but marks the business
