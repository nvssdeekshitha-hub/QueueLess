import crypto from 'crypto';

/**
 * Generates a human-friendly, uppercase alphanumeric booking reference
 * Format: QL-YYYYMMDD-XXXX (e.g. QL-20261028-7A4B)
 */
export const generateBookingReference = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 4);
  return `QL-${dateStr}-${randomSuffix}`;
};

/**
 * Formats a sequential queue token
 * Format: [SERVICE_CODE]-[001]
 * Example: REC-001, FEE-012, ADM-105
 */
export const formatTokenNumber = (serviceCode, sequenceNumber) => {
  const prefix = (serviceCode || 'TKN').toUpperCase().slice(0, 5);
  const paddedSeq = String(sequenceNumber).padStart(3, '0');
  return `${prefix}-${paddedSeq}`;
};
