const RateCard = require('../models/RateCard');
const Zone = require('../models/Zone');

/**
 * Calculates the volumetric weight of a package.
 * Formula: (Length * Breadth * Height) / 5000
 */
function calculateVolumetricWeight(length, breadth, height) {
  return (length * breadth * height) / 5000;
}

/**
 * Extracts and maps pincodes to active zones.
 */
async function getZoneByPincode(pincode) {
  if (!pincode) return null;
  const cleanPincode = pincode.toString().trim();
  const zone = await Zone.findOne({ pincodes: cleanPincode });
  return zone ? zone.name : null;
}

/**
 * Calculates delivery charges dynamically using database rate cards.
 */
async function calculatePrice({
  pickupPincode,
  dropPincode,
  length,
  breadth,
  height,
  weight,
  customerType,
  paymentMethod
}) {
  // 1. Resolve zones
  const pickupZone = await getZoneByPincode(pickupPincode);
  const dropZone = await getZoneByPincode(dropPincode);

  if (!pickupZone) {
    throw new Error(`Pickup pincode '${pickupPincode}' is not mapped to any shipping zone.`);
  }
  if (!dropZone) {
    throw new Error(`Drop pincode '${dropPincode}' is not mapped to any shipping zone.`);
  }

  // 2. Weight Calculations
  const volumetricWeight = calculateVolumetricWeight(length, breadth, height);
  const billableWeight = Math.max(weight, volumetricWeight);

  // 3. Find matched Rate Card
  const rateCard = await RateCard.findOne({
    pickupZone,
    dropZone,
    customerType,
    paymentMethod
  });

  if (!rateCard) {
    throw new Error(
      `No active Rate Card found for Route: ${pickupZone} -> ${dropZone} (${customerType}, ${paymentMethod}).`
    );
  }

  // 4. Compute cost
  const baseWeightLimit = rateCard.baseWeightLimit;
  const baseRate = rateCard.baseRate;
  const perKgIncrementalRate = rateCard.perKgIncrementalRate;
  const extraCharge = rateCard.extraCharge || 0;

  let totalRate = baseRate + extraCharge;
  let incrementalRateCharge = 0;

  if (billableWeight > baseWeightLimit) {
    const excessWeight = billableWeight - baseWeightLimit;
    // Round excess weight to the next full kg for incremental pricing
    const billableExcess = Math.ceil(excessWeight);
    incrementalRateCharge = billableExcess * perKgIncrementalRate;
    totalRate += incrementalRateCharge;
  }

  return {
    pickupZone,
    dropZone,
    volumetricWeight: parseFloat(volumetricWeight.toFixed(2)),
    billableWeight: parseFloat(billableWeight.toFixed(2)),
    baseRate,
    incrementalRate: incrementalRateCharge,
    codCharge: extraCharge,
    totalRate: parseFloat(totalRate.toFixed(2))
  };
}

module.exports = {
  calculateVolumetricWeight,
  getZoneByPincode,
  calculatePrice
};
