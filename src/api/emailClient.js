export const emailClient = {
    // Replace this with your actual Template ID from EmailJS Dashboard -> Email Templates
    templateId: 'template_glvghhy',
    serviceId: 'service_fijermn',
    publicKey: 'L5BiRHpElhWTZE1TQ',

    /**
     * Send an email using EmailJS REST API
     * @param {Object} templateParams - Variables to pass to the template (e.g., to_name, message, etc.)
     */
    sendEmail: async (templateParams) => {
        if (!emailClient.templateId) {
            console.warn("EmailJS: Please provide your Template ID to send emails.");
            return { success: false, error: "Missing Template ID" };
        }

        try {
            const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    service_id: emailClient.serviceId,
                    template_id: emailClient.templateId,
                    user_id: emailClient.publicKey,
                    template_params: templateParams,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`EmailJS Error: ${errorText}`);
            }

            return { success: true };
        } catch (error) {
            console.error('Failed to send email:', error);
            return { success: false, error: error.message };
        }
    }
};
