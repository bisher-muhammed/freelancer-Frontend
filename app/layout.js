// app/layout.js
import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "FreelancerHub",
  description: "Hire freelancers and manage contracts, tracked time and payments.",
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
