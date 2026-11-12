const form = document.querySelector("#waitlist-form");
const button = form.querySelector('button[type="submit"]');
const status = document.querySelector("#waitlist-status");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (button.disabled) return;

  button.disabled = true;
  button.textContent = "Joining…";
  status.textContent = "";
  status.dataset.error = "false";

  try {
    // Keep Brevo's generated field names and honeypot when updating this form.
    const response = await fetch(`${form.action}?isAjax=1`, {
      method: "POST",
      body: new FormData(form),
      signal: AbortSignal.timeout(15000),
    });
    const result = await response.json();
    if (!response.ok || result.success !== true) throw new Error("Signup failed");

    form.reset();
    status.textContent = "You're on the list! We'll email your TestFlight invitation and launch updates.";
  } catch {
    status.dataset.error = "true";
    status.textContent = "We couldn't save your email. Please try again, or contact support@typez.app.";
  } finally {
    button.disabled = false;
    button.textContent = "Join the waitlist";
  }
});
