// app/layout.js
import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "Your App",
  description: "Client dashboard with persisted login",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
           src="https://accounts.google.com/gsi/client"
          async
          defer
        ></script>
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
