import Appointment from '../models/Appointment.js';

/**
 * Server-rendered EJS appointment token receipt
 * GET /receipt/:bookingReference
 * Demonstrates Express server-side rendering (SSR) coexisting with a React SPA
 */
export const renderReceipt = async (req, res, next) => {
  try {
    const { bookingReference } = req.params;

    const appointment = await Appointment.findOne({
      bookingReference: bookingReference.toUpperCase().trim(),
    })
      .populate('service')
      .populate('user');

    if (!appointment) {
      return res.status(404).render('receipt', {
        appointment: null,
        error: `No appointment found with booking reference: "${bookingReference}"`,
      });
    }

    return res.render('receipt', {
      appointment,
      error: null,
      generatedAt: new Date().toLocaleString(),
    });
  } catch (error) {
    next(error);
  }
};
