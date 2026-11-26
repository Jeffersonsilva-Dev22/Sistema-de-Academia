"use strict";

const plans = [
  { name: "Prata", base: 110, benefits: "5 dias por semana e 1 aula avulsa por mês." },
  { name: "Ouro", base: 150, benefits: "7 dias por semana, Bike e Box." },
  { name: "Diamante", base: 200, benefits: "7 dias por semana, Bike, Box e até 3 convites por mês." }
];
const periods = {
  mensal: { name: "Mensal", percent: 100 },
  trimestral: { name: "Trimestral", percent: 90 },
  anual: { name: "Anual", percent: 80 }
};
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const cards = document.querySelector("#planCards");
const periodButtons = document.querySelectorAll("[data-period]");
const dialog = document.querySelector("#account");
const form = document.querySelector("#accountForm");
const title = document.querySelector("#dialogTitle");
const intro = document.querySelector("#dialogIntro");
const feedback = document.querySelector("#feedback");
const switchMode = document.querySelector("#switchMode");
const submit = document.querySelector("#submitAccount");
const nameField = document.querySelector("#nameField");
const cpfField = document.querySelector("#cpfField");
const loginLabel = document.querySelector("#loginLabel");
const { nome, login, cpf, senha } = form.elements;
let period = "mensal";
let mode = "login";
let selectedPlan = "";

function showPlans() {
  const selection = periods[period];
  cards.innerHTML = plans.map(({ name, base, benefits }) =>
    '<article class="plan' + (name === "Ouro" ? ' featured' : '') + '">' +
    '<h3>' + name + '</h3>' +
    '<p class="price">' + currency.format(base * selection.percent / 100) + ' <small>/ mês</small></p>' +
    '<p class="benefits">' + benefits + '</p>' +
    '<button type="button" class="button" data-plan="' + name + '">Escolher ' + name + ' ↗</button></article>'
  ).join("");
}

function setMode(nextMode) {
  mode = nextMode;
  const registering = mode === "register";
  title.textContent = registering ? "Seja um membro" : "Área do aluno";
  intro.textContent = registering
    ? (selectedPlan ? "Plano " + selectedPlan + ". Cadastro demonstrativo." : "Cadastro demonstrativo.")
    : "Acesso demonstrativo com a conta de teste do aluno.";
  nameField.hidden = cpfField.hidden = !registering;
  nome.required = cpf.required = registering;
  loginLabel.textContent = registering ? "E-mail" : "E-mail ou CPF";
  login.type = registering ? "email" : "text";
  senha.autocomplete = registering ? "new-password" : "current-password";
  senha.minLength = registering ? 6 : 0;
  submit.textContent = registering ? "Simular cadastro" : "Entrar";
  switchMode.textContent = registering ? "Já tenho conta" : "Criar conta";
  form.reset();
  feedback.textContent = registering ? "" : "Teste com lucas@email.com e a senha aluno123.";
}

function openAccount(nextMode, plan = "") {
  selectedPlan = plan;
  setMode(nextMode);
  dialog.showModal();
  (nextMode === "register" ? nome : login).focus();
}

periodButtons.forEach(button => button.addEventListener("click", () => {
  period = button.dataset.period;
  periodButtons.forEach(option => option.setAttribute("aria-pressed", String(option === button)));
  showPlans();
}));

cards.addEventListener("click", event => {
  const button = event.target.closest("[data-plan]");
  if (button) openAccount("register", button.dataset.plan + " " + periods[period].name);
});
document.querySelectorAll("[data-open]").forEach(button => {
  button.addEventListener("click", () => openAccount(button.dataset.open));
});
document.querySelector("#closeAccount").addEventListener("click", () => dialog.close());
switchMode.addEventListener("click", () => {
  setMode(mode === "login" ? "register" : "login");
  (mode === "register" ? nome : login).focus();
});

const digits = value => value.replace(/\D/g, "");

cpf.addEventListener("input", () => {
  cpf.value = digits(cpf.value).slice(0, 11)
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3}\.\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
});

form.addEventListener("submit", event => {
  event.preventDefault();
  if (mode === "register") {
    if (!nome.value.trim() || digits(cpf.value).length !== 11) {
      feedback.textContent = "Informe seu nome e um CPF com 11 dígitos.";
      (!nome.value.trim() ? nome : cpf).focus();
      return;
    }
    feedback.textContent = "Cadastro simulado. Nenhum dado foi enviado ou salvo.";
    form.reset();
    return;
  }
  const identifier = login.value.trim().toLowerCase();
  const matchingUser = identifier === "lucas@email.com" ||
    (/^[\d.\-]+$/.test(identifier) && digits(identifier) === "04628094083");
  feedback.textContent = matchingUser && senha.value === "aluno123"
    ? "Bem-vindo, Lucas Silva! Acesso de demonstração validado."
    : "Dados incorretos. Use a conta de teste exibida no formulário.";
  senha.value = "";
});

dialog.addEventListener("close", () => form.reset());
showPlans();
