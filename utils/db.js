
const users= [
  {
    id: "1",
    email: "wowdash@gmail.com",
    name: "Wowdash",
    password: "Pa$$w0rd!"
  }
]

export async function getUserFromDb(email, hashedPassword) {
  const find = users.find(user => user.email === email && user.password === hashedPassword)
  return find || null
}
