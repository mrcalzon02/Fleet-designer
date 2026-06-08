package com.orbitalworks.fleetdesigner.data;

import com.orbitalworks.fleetdesigner.model.CompanyState;
import com.orbitalworks.fleetdesigner.model.GameState;

import java.util.List;

public final class InitialGameStateFactory {
    private InitialGameStateFactory() {
    }

    public static GameState create() {
        CompanyState company = new CompanyState(
                "Orbital Works",
                12_400_000,
                42,
                7,
                420_000,
                6,
                5,
                100,
                "operating"
        );

        return new GameState(
                company,
                3,
                10,
                6,
                0,
                List.of(
                        "Cycle 007: Java Swing redevelopment shell online.",
                        "Cycle 007: Electron prototype demoted to reference implementation.",
                        "Cycle 007: Researchers and engineers remain separate population pools."
                )
        );
    }
}
