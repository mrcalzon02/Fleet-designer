package com.orbitalworks.fleetdesigner.command;

import com.orbitalworks.fleetdesigner.model.CompanyState;
import com.orbitalworks.fleetdesigner.model.GameState;

public final class AdvanceCycleCommand implements GameCommand {
    @Override
    public void execute(GameState state) {
        CompanyState company = state.getCompany();
        company.setCycle(company.getCycle() + 1);
        company.setCash(company.getCash() - company.getBurnRate());

        if (company.getCash() <= 0) {
            company.setStatus("bankrupt");
            state.addEvent("Cycle " + formatCycle(company.getCycle()) + ": Bankruptcy triggered in Java shell prototype.");
            return;
        }

        state.addEvent(
                "Cycle " + formatCycle(company.getCycle())
                        + ": Cycle advanced through Java command authority. Operating burn CR "
                        + String.format("%,d", company.getBurnRate())
                        + "."
        );
    }

    private String formatCycle(int cycle) {
        return String.format("%03d", cycle);
    }
}
