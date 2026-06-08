package com.orbitalworks.fleetdesigner.command;

import com.orbitalworks.fleetdesigner.model.GameState;

@FunctionalInterface
public interface GameCommand {
    void execute(GameState state);
}
