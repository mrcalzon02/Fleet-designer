package com.orbitalworks.fleetdesigner.model;

public final class CompanyState {
    private final String name;
    private int cash;
    private int reputation;
    private int cycle;
    private int burnRate;
    private int factoryCapacity;
    private int productionLineCapacity;
    private int warehouseCapacity;
    private String status;

    public CompanyState(
            String name,
            int cash,
            int reputation,
            int cycle,
            int burnRate,
            int factoryCapacity,
            int productionLineCapacity,
            int warehouseCapacity,
            String status
    ) {
        this.name = name;
        this.cash = cash;
        this.reputation = reputation;
        this.cycle = cycle;
        this.burnRate = burnRate;
        this.factoryCapacity = factoryCapacity;
        this.productionLineCapacity = productionLineCapacity;
        this.warehouseCapacity = warehouseCapacity;
        this.status = status;
    }

    public String getName() {
        return name;
    }

    public int getCash() {
        return cash;
    }

    public void setCash(int cash) {
        this.cash = cash;
    }

    public int getReputation() {
        return reputation;
    }

    public void setReputation(int reputation) {
        this.reputation = reputation;
    }

    public int getCycle() {
        return cycle;
    }

    public void setCycle(int cycle) {
        this.cycle = cycle;
    }

    public int getBurnRate() {
        return burnRate;
    }

    public void setBurnRate(int burnRate) {
        this.burnRate = burnRate;
    }

    public int getFactoryCapacity() {
        return factoryCapacity;
    }

    public void setFactoryCapacity(int factoryCapacity) {
        this.factoryCapacity = factoryCapacity;
    }

    public int getProductionLineCapacity() {
        return productionLineCapacity;
    }

    public void setProductionLineCapacity(int productionLineCapacity) {
        this.productionLineCapacity = productionLineCapacity;
    }

    public int getWarehouseCapacity() {
        return warehouseCapacity;
    }

    public void setWarehouseCapacity(int warehouseCapacity) {
        this.warehouseCapacity = warehouseCapacity;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
