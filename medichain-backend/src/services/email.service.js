export async function sendEmail({ to, subject, text, html }) {
  console.log(`[Email Service] Start sending email via Google Apps Script API to: ${to}, Subject: "${subject}"`);
  
  // We use the environment variables, but provide the hardcoded URL/Secret as fallback 
  // so it works instantly without you having to update .env on Render first!
  const scriptUrl = process.env.GMAIL_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbxv0Z0_WAFuBl9ZI42sYL-Pf38bnHXHRHi_ZrRgeT0o84b-npTZYCrLr5RuCkD979L7-w/exec";
  const secretKey = process.env.GMAIL_SCRIPT_SECRET || "medichain_secret_key_123";

  try {
    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        secret: secretKey,
        to: to,
        subject: subject,
        text: text || "",
        html: html || ""
      })
    });

    const result = await response.json();

    if (result.error) {
      console.error("[Email Service] Google Apps Script API Error:", result.error);
      return { error: result.error };
    }

    console.log(`[Email Service] Success! Message sent securely via HTTP API.`);
    return { success: true };
  } catch (error) {
    console.error("[Email Service] ERROR sending email via HTTP API:", error);
    return { error: error.message };
  }
}
