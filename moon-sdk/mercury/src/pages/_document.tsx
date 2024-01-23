import { Html, Head, Main, NextScript } from 'next/document'
import Image from 'next/image'

//import '/styles/mercury.css'
//import './styles/global.css'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
    {/* <meta charset="UTF-8"></meta> */}
    <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
    <title>Mercury</title>
    {/* <link href="/styles/mercury.css"/> */}
      </Head>
      <body>
      
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
