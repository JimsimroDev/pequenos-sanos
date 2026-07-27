package uk.jimsimrodev.pequenos_sanos.domain.sesion.websocket;

import org.springframework.stereotype.Component;
import uk.jimsimrodev.pequenos_sanos.domain.sesion.websocket.dto.AvatarState;

import java.util.Collection;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory store for avatar positions and active session timers.
 * Thread-safe using {@link ConcurrentHashMap}; state is persisted to PostgreSQL on session close.
 */
@Component
public class GameStateStore {

    /** Maps perfilId → current avatar state on the map. */
    private final ConcurrentHashMap<Long, AvatarState> avatares = new ConcurrentHashMap<>();

    /**
     * Maps perfilId → remaining seconds for this session.
     * Decremented every second by {@link SessionTimerService}.
     */
    private final ConcurrentHashMap<Long, Integer> timers = new ConcurrentHashMap<>();

    // --- Avatar operations ---

    /**
     * Updates or registers an avatar position on the map.
     *
     * @param state the new avatar state
     */
    public void updateAvatar(AvatarState state) {
        avatares.put(state.perfilId(), state);
    }

    /**
     * Returns all current avatar states.
     *
     * @return collection of avatar states
     */
    public Collection<AvatarState> getAllAvatares() {
        return avatares.values();
    }

    /**
     * Removes an avatar from the map (when session ends).
     *
     * @param perfilId the child profile ID
     */
    public void removeAvatar(Long perfilId) {
        avatares.remove(perfilId);
    }

    // --- Timer operations ---

    /**
     * Registers a new session timer for a profile.
     *
     * @param perfilId         the child profile ID
     * @param segundosRestantes total allowed seconds today
     */
    public void registerTimer(Long perfilId, int segundosRestantes) {
        timers.put(perfilId, segundosRestantes);
    }

    /**
     * Returns the remaining seconds for a profile, or null if not registered.
     *
     * @param perfilId the child profile ID
     * @return remaining seconds, or null
     */
    public Integer getTimer(Long perfilId) {
        return timers.get(perfilId);
    }

    /**
     * Decrements the timer by 1 second and returns the new value.
     *
     * @param perfilId the child profile ID
     * @return new remaining seconds, or null if not registered
     */
    public Integer decrementTimer(Long perfilId) {
        return timers.computeIfPresent(perfilId, (k, v) -> Math.max(0, v - 1));
    }

    /**
     * Removes the timer when the session ends.
     *
     * @param perfilId the child profile ID
     */
    public void removeTimer(Long perfilId) {
        timers.remove(perfilId);
    }

    /**
     * Returns all profile IDs that have active timers.
     *
     * @return set of perfilIds with active timers
     */
    public java.util.Set<Long> getActiveTimerProfiles() {
        return timers.keySet();
    }
}
