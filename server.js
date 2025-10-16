import express from "express";
import router from "./routes/index.js";

const app = express();
app.use(express.json());
app.use("/", router);

const PORT = 3030;
app.listen(PORT, () => console.log(`✅ Servidor escuchando en puerto ${PORT}`));
