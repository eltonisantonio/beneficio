# Portal de Benefícios Raguife

Sistema único com duas áreas, hospedado de graça no GitHub Pages, usando Firebase
(Firestore + Authentication) como back-end.

- **Funcionário** (`index.html`): celular, login só por CPF, vê os benefícios do
  seu perfil e participa do sorteio do cinema. Instalável como app (PWA).
- **RH / DP** (`rh.html`): computador, login com e-mail e senha, cadastra
  benefícios e perfis, importa a base de funcionários (planilha mensal), cria e
  realiza sorteios, e tem trilha de auditoria.

---

## 1. Estrutura dos arquivos

```
index.html              Área do funcionário
rh.html                 Área do RH/DP
manifest.webmanifest    Configuração do app instalável (PWA)
service-worker.js       Cache da interface (abertura rápida/offline)
firestore.rules         Regras de segurança do banco (copiar no console)
/assets/logo.js         Logo da Raguife (compartilhado)
/css                    base.css (comum) · employee.css · rh.css
/js                     firebase.js · helpers.js · db.js (compartilhados)
                        employee.js (funcionário) · rh.js (RH)
/icons                  Ícones do PWA
```

A ideia central: `firebase.js`, `helpers.js` e `db.js` são **compartilhados**
pelas duas áreas. Toda leitura/escrita no banco passa pelo `db.js` — é o único
lugar que você precisa mexer para mudar regras de dados.

---

## 2. Publicar no GitHub Pages

1. Suba todos os arquivos (mantendo as pastas) para o repositório
   `eltonisantonio/beneficio`, na branch `main`.
2. No GitHub: **Settings → Pages**.
3. Em **Source**, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`.
4. Salve. Em 1–2 minutos o portal estará em:
   - Funcionário: `https://eltonisantonio.github.io/beneficio/`
   - RH/DP: `https://eltonisantonio.github.io/beneficio/rh.html`

> Sempre que atualizar arquivos, suba a versão do cache em `service-worker.js`
> (troque `raguife-v1` por `raguife-v2`, etc.) para os celulares pegarem a nova versão.

---

## 3. Configurar o Firebase (uma vez só)

Projeto já criado: **beneficios-f89ea**. No [console.firebase.google.com](https://console.firebase.google.com):

### 3.1. Firestore
1. **Build → Firestore Database → Create database** (modo de produção, região
   `southamerica-east1` se disponível).
2. Aba **Rules**: apague o conteúdo, cole **todo** o arquivo `firestore.rules`
   deste projeto e clique em **Publish**.

### 3.2. Authentication (login do RH)
1. **Build → Authentication → Get started**.
2. Aba **Sign-in method → Email/Password → Enable → Save**.
3. Aba **Users → Add user**: crie o **primeiro usuário do RH** (e-mail + senha).
   Esse é o login de quem vai administrar. Pode criar quantos quiser, um por pessoa.

> Não existe "cadastro" dentro do sistema: usuários do RH são criados aqui no
> console. Isso é proposital — evita que qualquer um crie acesso administrativo.

Pronto. Não precisa configurar mais nada de servidor.

---

## 4. Primeiro acesso do RH

1. Abra `…/rh.html`, entre com o e-mail e senha criados no passo 3.2.
2. Os 4 perfis padrão (Raguife, Raguife BD, Comercial, Estagiário/Aprendiz) são
   criados sozinhos. Ajuste em **Perfis** se precisar.
3. Cadastre os benefícios em **Benefícios**.
4. Importe a base de funcionários em **Funcionários** (próximo passo).

---

## 5. Importar funcionários (planilha mensal)

Na aba **Funcionários → Importar planilha**. A importação **substitui toda a
base anterior** (quem saiu some, quem entrou aparece).

A planilha (`.xlsx`, `.xls` ou `.csv`) precisa ter, no mínimo, estas colunas
(o nome pode ter acento ou não, maiúsculas ou não):

| Coluna obrigatória | Para quê |
|---|---|
| **Nome** | Nome do funcionário |
| **CPF** | Identificação no login (com ou sem pontos) |
| **Perfil** | Liga o funcionário aos benefícios. Deve **casar com o nome de um perfil cadastrado** |

Colunas opcionais reconhecidas: `Unidade`, `Departamento`, `Cargo`, `Situação`,
`Data de Admissão`, `Matrícula`.

Fluxo: escolher arquivo → conferir a **amostra** → **Substituir base**. Se algum
perfil da planilha não casar com os cadastrados, o funcionário entra mesmo assim,
mas aparece com aviso "Sem perfil" (ele só verá benefícios sem restrição de perfil).

> **Privacidade:** o CPF **não é gravado aberto**. Guardamos apenas o CPF
> mascarado (`***.456.789-**`) e um código embaralhado (hash) usado no login.

---

## 6. Sorteio do cinema

Na aba **Sorteios**:

1. **+ Novo sorteio**: dê um título, defina início/fim das inscrições e cadastre
   os **filmes** com a quantidade de ingressos de cada um.
2. Deixe o status em **Inscrições abertas** para liberar a participação. Os
   funcionários verão o card "Quero participar" no celular.
3. Quando encerrar, abra o sorteio e clique em **🎲 Realizar sorteio**.
4. Confira os ganhadores e clique em **📣 Publicar resultado**. Só então o
   funcionário vê se foi contemplado (com o código do voucher).

Regras automáticas do sorteio:
- Só concorre quem se inscreveu.
- Cada pessoa ganha no máximo **um** prêmio por sorteio.
- Ninguém ganha de novo um **filme que já ganhou** antes (em qualquer semana).

---

## 7. Privacidade / LGPD (resumo)

- O funcionário só consegue ler o **próprio** cadastro (a busca é feita pelo
  código do CPF dele); ele não consegue listar os outros.
- Não há lista pública de ganhadores: cada um vê só o próprio resultado.
- As regras que garantem isso estão no `firestore.rules` — é o que vale de
  verdade, mesmo que alguém tente acessar o banco por fora do site.

---

## 8. Dúvidas comuns

- **"CPF não encontrado" no login do funcionário:** o CPF não está na base ativa.
  Confira a última importação.
- **Funcionário não vê um benefício:** verifique se o benefício está **ativo**,
  dentro do período de datas, e se o **perfil** dele está marcado no benefício
  (benefício sem nenhum perfil marcado aparece para todos).
- **Esqueci a senha do RH:** redefina pelo console do Firebase
  (Authentication → usuário → reset de senha).
