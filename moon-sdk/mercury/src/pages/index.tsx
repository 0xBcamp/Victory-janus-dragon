import Image from 'next/image'
import { Inter } from 'next/font/google'

import SignupPage  from './_app';


const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return SignupPage
}
