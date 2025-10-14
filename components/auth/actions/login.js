'use server'

export const handleLoginAction = async (formData) => {
  const email = formData.get('email') 
  const password = formData.get('password') 

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  // (Optional) Validate credentials format
  if (!email.includes('@')) {
    return { error: 'Invalid email format.' }
  }

  // You can optionally log or validate against DB here
  return { success: true }
}
