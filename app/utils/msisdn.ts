/**
 * Mozambique MSISDN format: 9 digits, mobile starts with 8 (e.g. 841234567).
 * We do not use +258; validators accept only this local format.
 */

/** Mozambique mobile: 9 digits starting with 8 (e.g. 84, 82, 86, 87, 85), sem +258 */
export const MOZ_MSISDN_REGEX = /^8\d{8}$/
