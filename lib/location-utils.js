import { City, State } from "country-state-city";

/**
 * city-state slug helpers
 * example: bangalore-urban-karnataka
 */

export function createLocationSlug(city, state) {
  if (!city || !state) return "";

  return `${city}-${state}`
    .toLowerCase()
    .replace(/\s+/g, "-");
}

export function parseLocationSlug(slug) {
  if (!slug || typeof slug !== "string") {
    return { city: null, state: null, isValid: false };
  }

  const parts = slug.split("-");

  if (parts.length < 2) {
    return { city: null, state: null, isValid: false };
  }

  const indianStates = State.getStatesOfCountry("IN");

  // 🔑 find the state from the END of slug
  for (let i = 1; i < parts.length; i++) {
    const possibleState = parts.slice(i).join(" ");

    const stateObj = indianStates.find(
      (s) => s.name.toLowerCase() === possibleState.toLowerCase()
    );

    if (stateObj) {
      const citySlug = parts.slice(0, i).join(" ");

      const cityName = citySlug
        .split(" ")
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      const cities = City.getCitiesOfState("IN", stateObj.isoCode);

      const cityExists = cities.some(
        (c) => c.name.toLowerCase() === cityName.toLowerCase()
      );

      if (!cityExists) {
        return { city: null, state: null, isValid: false };
      }

      return {
        city: cityName,
        state: stateObj.name,
        isValid: true,
      };
    }
  }

  return { city: null, state: null, isValid: false };
}
