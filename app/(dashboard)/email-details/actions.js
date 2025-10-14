'use server'

export async function sendMessageAction(formData) {
    const message = formData.get("message");
    const attachment = formData.get("attachment");
    const gallery = formData.get("gallery");
}
