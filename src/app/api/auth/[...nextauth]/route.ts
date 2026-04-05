import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcrypt"
import prisma from "@/lib/prisma"

// NextAuth exige un secret en NODE_ENV=production. Si falta, muestra exactamente
// "There is a problem with the server configuration" (no es un fallo de Prisma/MySQL).
const authSecret =
  process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || undefined

const handler = NextAuth({
  secret: authSecret,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })
        
        if (!user) return null
        
        const isPasswordValid = await compare(credentials.password, user.password_hash)
        
        if (!isPasswordValid) return null
        
        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name
        }
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as any).id = token.sub;
      }
      return session
    }
  }
})

export { handler as GET, handler as POST }
