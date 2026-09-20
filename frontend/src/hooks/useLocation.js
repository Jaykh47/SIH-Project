import { useState, useEffect } from "react";
import { fetchStates, fetchDistricts } from "../services/locationService";

export function useLocation(stateSlug) {
  const [states, setStates] = useState([]);
  const [statesLoading, setStatesLoading] = useState(true);
  const [statesError, setStatesError] = useState("");

  const [districts, setDistricts] = useState([]);
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [districtsError, setDistrictsError] = useState("");

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

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!stateSlug) {
      setDistricts([]);
      setDistrictsError("");
      return;
    }

    let cancelled = false;
    setDistrictsLoading(true);
    setDistrictsError("");

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

    return () => { cancelled = true; };
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
