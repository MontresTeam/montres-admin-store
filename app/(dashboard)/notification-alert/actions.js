"use server";

export async function handleNotificationForm(formData) {
  const message = formData.get("message");
  const status = formData.get("status");

  console.log("Notification Message:", message);
  console.log("Switch Status:", status);

  // Save to database, send to API, etc.
}
