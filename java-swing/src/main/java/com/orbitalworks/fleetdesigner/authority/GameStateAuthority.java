package com.orbitalworks.fleetdesigner.authority;

import com.orbitalworks.fleetdesigner.command.GameCommand;
import com.orbitalworks.fleetdesigner.model.GameState;

import java.util.ArrayList;
import java.util.List;

public final class GameStateAuthority {
    private final GameState state;
    private final List<Runnable> listeners = new ArrayList<>();

    public GameStateAuthority(GameState state) {
        this.state = state;
    }

    public GameState getState() {
        return state;
    }

    public void dispatch(GameCommand command) {
        command.execute(state);
        notifyListeners();
    }

    public void addChangeListener(Runnable listener) {
        listeners.add(listener);
    }

    private void notifyListeners() {
        for (Runnable listener : List.copyOf(listeners)) {
            listener.run();
        }
    }
}
