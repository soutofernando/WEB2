import express from "express";
import dotenv from "dotenv";
import sequelize from "./config/database";
import "./models/associations";
import routes from "./routes";
import authRoutes from "./routes/authRoutes";
import { authenticate } from "./middlewares/authMiddleware";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/api", authenticate, routes);

app.get("/protected", authenticate, (req, res) => {
  res.status(200).json({ message: "Você tem acesso a esta rota protegida" });
});

const PORT = process.env.PORT || 3000;

sequelize
  .sync({ force: true })
  .then(() => {
    console.log("Banco de dados conectado!");
    app.listen(PORT, () =>
      console.log(`Servidor rodando na porta ${PORT}`)
    );
  })
  .catch((error) => {
    console.error("Erro ao conectar ao banco de dados:", error);
  });



