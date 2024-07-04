// vite.config.js
import basicSsl from "@vitejs/plugin-basic-ssl";
import { server } from "typescript";

export default {
  server: {
    https: true,
    host: "0.0.0.0"
  },
  plugins: [basicSsl()],
};
