package com.orbitalworks.fleetdesigner.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public final class GameState {
    private final CompanyState company;
    private final List<String> eventLog;
    private int researcherCount;
    private int engineerCount;
    private int openContractCount;
    private int productionRunCount;

    public GameState(
            CompanyState company,
            int researcherCount,
            int engineerCount,
            int openContractCount,
            int productionRunCount,
            List<String> eventLog
    ) {
        this.company = company;
        this.researcherCount = researcherCount;
        this.engineerCount = engineerCount;
        this.openContractCount = openContractCount;
        this.productionRunCount = productionRunCount;
        this.eventLog = new ArrayList<>(eventLog);
    }

    public CompanyState getCompany() {
        return company;
    }

    public int getResearcherCount() {
        return researcherCount;
    }

    public void setResearcherCount(int researcherCount) {
        this.researcherCount = researcherCount;
    }

    public int getEngineerCount() {
        return engineerCount;
    }

    public void setEngineerCount(int engineerCount) {
        this.engineerCount = engineerCount;
    }

    public int getOpenContractCount() {
        return openContractCount;
    }

    public void setOpenContractCount(int openContractCount) {
        this.openContractCount = openContractCount;
    }

    public int getProductionRunCount() {
        return productionRunCount;
    }

    public void setProductionRunCount(int productionRunCount) {
        this.productionRunCount = productionRunCount;
    }

    public List<String> getEventLog() {
        return Collections.unmodifiableList(eventLog);
    }

    public void addEvent(String event) {
        eventLog.add(0, event);
        while (eventLog.size() > 30) {
            eventLog.remove(eventLog.size() - 1);
        }
    }
}
