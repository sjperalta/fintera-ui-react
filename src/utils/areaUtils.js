/**
 * Utility functions for area conversions.
 * 
 * Base unit is assumed to be Square Meters (m²).
 */

export const M2_TO_FT2_FACTOR = 10.7639;
export const M2_TO_VARA2_FACTOR = 1.431;

/**
 * Calculates lot areas in different units.
 * 
 * @param {number} area - The area value.
 * @param {string} unit - The unit of the input area (default: 'm2').
 * @returns {Object} An object containing formatted areas in m², ft², and varas².
 */
export const calculateLotAreas = (area, unit = 'm2') => {
    const value = Number(area) || 0;

    let areaM2 = value;

    // Convert input to m2 if necessary (currently only supporting m2 input logic based on current requirements)
    // If in the future we support other input units, we'd convert them to m2 here first.
    if (unit === 'ft2') {
        areaM2 = value / M2_TO_FT2_FACTOR;
    } else if (unit === 'vara2') {
        areaM2 = value / M2_TO_VARA2_FACTOR;
    }

    return {
        m2: Number(areaM2.toFixed(2)),
        ft2: Number((areaM2 * M2_TO_FT2_FACTOR).toFixed(2)),
        vara2: Number((areaM2 * M2_TO_VARA2_FACTOR).toFixed(2)),
    };
};

export const formatArea = (value, unit) => {
    return `${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)} ${unit}`;
}
