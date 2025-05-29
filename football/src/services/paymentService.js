// Simulated payment processing service
const processPayment = async (paymentDetails) => {
  // In a real application, this would integrate with a payment gateway
  // For demo purposes, we'll simulate a successful payment after a delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate successful payment
      if (isValidPaymentDetails(paymentDetails)) {
        resolve({
          success: true,
          transactionId: `TXN${Date.now()}`,
          message: 'Payment processed successfully'
        });
      } else {
        resolve({
          success: false,
          error: 'Invalid payment details'
        });
      }
    }, 1500); // Simulate network delay
  });
};

// Validate payment details
const isValidPaymentDetails = (details) => {
  const { cardNumber, cardHolder, expiryDate, cvv } = details.cardDetails;
  
  // Basic validation
  if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
    return false;
  }
  
  if (!cardHolder || cardHolder.trim().length < 3) {
    return false;
  }
  
  if (!expiryDate || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
    return false;
  }
  
  if (!cvv || !/^\d{3,4}$/.test(cvv)) {
    return false;
  }
  
  return true;
};

export { processPayment }; 