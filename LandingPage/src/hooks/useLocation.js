// src/hooks/useLocation.js
// ─────────────────────────────────────────────────────────────────────────────
// Custom hook — manages states list + district list loading.
// Fetches states on mount. Re-fetches districts whenever stateSlug changes.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { fetchStates, fetchDistricts } from "../services/locationService";

/**
 * @param {string} stateSlug  slug of the currently selected state (may be "")
 *
 * @returns {{
 *   states:          Array<{ name: string, slug: string }>,
 *   districts:       Array<{ name: string, slug: string }>,
 *   statesLoading:   boolean,
 *   districtsLoading: boolean,
 *   statesError:     string,
 *   districtsError:  string,
 * }}
 */
export function useLocation(stateSlug) {
  const [states, setStates] = useState([]);
  const [statesLoading, setStatesLoading] = useState(true);
  const [statesError, setStatesError] = useState("");

  const [districts, setDistricts] = useState([]);
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [districtsError, setDistrictsError] = useState("");

  // ─── Load states once on mount ────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    setStatesLoading(true);
    setStatesError("");

    fetchStates()
      .then((data) => {
        if (!cancelled) setStates(data);
      })
      .catch((err) => {
        if (!cancelled) setStatesError(err.message);
      })
      .finally(() => {
        if (!cancelled) setStatesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // ─── Load districts whenever the selected state changes ───────────────────
  useEffect(() => {
    if (!stateSlug) {
      setDistricts([]);
      setDistrictsError("");
      return;
    }

    let cancelled = false;

    setDistrictsLoading(true);
    setDistrictsError("");
    setDistricts([]);

    fetchDistricts(stateSlug)
      .then((data) => {
        if (!cancelled) setDistricts(data);
      })
      .catch((err) => {
        if (!cancelled) setDistrictsError(err.message);
      })
      .finally(() => {
        if (!cancelled) setDistrictsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [stateSlug]);

  return {
    states,
    districts,
    statesLoading,
    districtsLoading,
    statesError,
    districtsError,
  };
}
