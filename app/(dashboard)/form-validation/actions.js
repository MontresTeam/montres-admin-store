'use server'

export async function formAction(formData) {
    firstName: formData.get("firstName");
    lastName: formData.get("lastName");
    email: formData.get("email");
    phone: formData.get("phone");
    password: formData.get("password");
}
