const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));

// ==== MongoDB Connection ====
mongoose
  .connect("mongodb+srv://joelbds87:X37ZLzK9GNweFqYQ@metasposto.qmbbw69.mongodb.net/metasposto")
  .then(() => console.log("✅ Conectado ao MongoDB"))
  .catch((err) => console.error("❌ Erro MongoDB:", err));

// ==== MODELOS ====
const metaSchema = new mongoose.Schema({
  mes: String,
  meta_valor: Number,
  progresso_diario: [{ dia: String, valor: Number }]
});

const userSchema = new mongoose.Schema({
  nome: String,
  username: String,
  senha: String,
  cargo: { type: String, default: "funcionario" }, // gerente ou funcionario
  rede_id: String,
  metas: [metaSchema],
});

const User = mongoose.model("User", userSchema);

// ==============================
// ROTAS
// ==============================

// === LOGIN ===
app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

app.post("/login", async (req, res) => {
  const { username, senha } = req.body;
  try {
    const user = await User.findOne({ username, senha });
    if (!user) return res.render("login", { error: "Usuário ou senha incorreta" });

    if (user.cargo === "gerente") return res.redirect("/dashboard");
    return res.redirect(`/dashboard-funcionario/${user._id}`);
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).send("Erro interno no servidor");
  }
});

app.get("/logout", (req, res) => res.redirect("/login"));

// === DASHBOARD GERENTE ===
app.get("/dashboard", async (req, res) => {
  try {
    const gerenteLogado = {
      nome: "Joel Batista dos Santos",
      rede_id: "Posto RM",
      cargo: "gerente"
    };

    const funcionarios = await User.find({ 
      rede_id: gerenteLogado.rede_id, 
      cargo: "funcionario" 
    }).lean();

    res.render("index", { user: gerenteLogado, funcionarios });
  } catch (err) {
    console.error("Erro ao carregar dashboard:", err);
    res.status(500).send("Erro ao carregar painel");
  }
});

// === DASHBOARD FUNCIONÁRIO ===
app.get("/dashboard-funcionario/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).lean();
    if (!user) return res.status(404).send("Funcionário não encontrado");

    const metaAtual = user.metas[user.metas.length - 1] || null;
    let totalVendido = 0, idealPorDia = 0, bateuMeta = false;

    if (metaAtual) {
      totalVendido = metaAtual.progresso_diario.reduce((s, p) => s + p.valor, 0);
      idealPorDia = metaAtual.meta_valor / 30;
      const mediaAtual = totalVendido / metaAtual.progresso_diario.length || 0;
      bateuMeta = mediaAtual >= idealPorDia;
    }

    res.render("dashboard_funcionario", { user, meta: metaAtual, totalVendido, idealPorDia, bateuMeta });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao carregar painel do funcionário");
  }
});

// === CRIAR USUÁRIO ===
app.get("/user/new", (req, res) => res.render("user_new"));
app.post("/user/new", async (req, res) => {
  const { nome, username, senha, rede_id, cargo } = req.body;
  try {
    await User.create({ nome, username, senha, rede_id, cargo: cargo || "funcionario" });
    res.redirect("/dashboard");
  } catch (err) {
    console.error("Erro ao criar usuário:", err);
    res.status(500).send("Erro ao criar usuário");
  }
});

// === ADICIONA META ===
app.post("/meta/add/:userId", async (req, res) => {
  try {
    const { mes, meta_valor } = req.body;
    const user = await User.findById(req.params.userId);
    user.metas.push({ mes, meta_valor, progresso_diario: [] });
    await user.save();
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao adicionar meta");
  }
});

// === ADICIONA VENDAS DIÁRIAS ===
app.post("/meta/add-progress/:userId/:metaId", async (req, res) => {
  try {
    const { dia, valor } = req.body;
    const user = await User.findById(req.params.userId);
    const meta = user.metas.id(req.params.metaId);
    meta.progresso_diario.push({ dia, valor: parseFloat(valor) });
    await user.save();
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao registrar venda");
  }
});

// === EXCLUIR USUÁRIO ===
app.post("/user/delete/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect("/dashboard");
});

// ==== SERVIDOR ====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando em http://localhost:${PORT}`));
