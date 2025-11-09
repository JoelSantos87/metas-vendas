const mongoose = require("mongoose");

// ======= Subdocumento: Progresso Diário =======
const progressoSchema = new mongoose.Schema(
  {
    dia: {
      type: String, // Ex: "2025-11-09"
      required: true,
    },
    valor: {
      type: Number, // Valor vendido ou atingido neste dia
      default: 0,
    },
  },
  { _id: false } // Evita criar IDs para cada entrada de progresso
);

// ======= Subdocumento: Meta Mensal =======
const metaSchema = new mongoose.Schema(
  {
    mes: {
      type: String, // Ex: "2025-11"
      required: true,
    },
    meta_valor: {
      type: Number,
      default: 0,
    },
    progresso_diario: [progressoSchema], // Entradas de progresso diário
  },
  { _id: true } // Cada meta mensal precisa de ID único
);

// ======= Schema Principal: Usuário =======
const userSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      // ⚠️ Em produção, lembre-se de usar bcrypt:
      // bcrypt.hashSync(password, salt)
    },
    role: {
      type: String,
      enum: ["gerente", "funcionario"],
      default: "funcionario",
    },
    rede_id: {
      type: String,
      required: true, // Identifica o posto/rede (ex: "Posto RM")
      trim: true,
    },
    metas: [metaSchema], // Array de metas mensais
  },
  {
    timestamps: true, // Cria automaticamente createdAt / updatedAt
  }
);

module.exports = mongoose.model("User", userSchema);
