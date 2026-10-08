# AlugaSom — aluguel de instrumentos musicais

Aplicação frontend para explorar instrumentos e simular uma reserva de aluguel, desenvolvida para o Projeto 1 da disciplina **Programação Web Fullstack**.

## Integrante

- **Pedro Augusto da Silva Morais — RA 2565935**

Este projeto está organizado para apresentação individual. 

## Tecnologias e requisitos

| Requisito | Implementação |
| --- | --- |
| React.js | Componentes funcionais e interface reativa |
| SPA | Catálogo, reservas e informações na mesma página, sem recarregamento |
| AJAX e API JSON pública | `fetch` consulta a API do Wikidata para carregar o catálogo |
| Hook escolhido | **useReducer**, em `src/contexts/RentalContext.jsx` e `rentalReducer.js` |
| Biblioteca externa | **Material UI**, com tema personalizado, formulários, modais e alertas |
| Integração funcional | Instrumentos da API → seleção → período → cálculo → reserva → histórico → cancelamento |
| Ferramentas de apoio | Uso de IA documentado ao final deste README |

`useState`, `useEffect`, `useRef` e `useMemo` também são usados. O hook principal declarado para a entrega é **useReducer**.

## Funcionalidades

- Catálogo com oito instrumentos, carregado a partir de uma API pública.
- Filtros por categoria: cordas, teclas, percussão e sopros.
- Busca por nome, categoria ou especificação, sem diferenciação de maiúsculas ou acentos.
- Ordenação por destaque, menor diária, maior diária e nome.
- Detalhes do kit, preço, estoque e dados retornados pela API, com link para a fonte.
- Seleção de instrumentos com controle de quantidade e remoção.
- Retirada e devolução, com períodos entre 1 e 30 diárias.
- Validação de nome, e-mail, datas e disponibilidade.
- Total calculado a partir das diárias e quantidades.
- Reservas simuladas salvas em `localStorage` e recuperadas ao recarregar.
- Cancelamento que libera o estoque para o mesmo período e preserva o histórico.
- Estados de carregamento, erro com nova tentativa e busca sem resultados.
- Layout responsivo e controles com rótulos acessíveis.

## Como executar

### Pré-requisitos

- Node.js 22.12 ou superior, com npm instalado.
- Conexão com a internet para instalar as dependências e consultar a API pública do Wikidata.

### 1. Baixar o projeto

Clone o repositório:

```bash
git clone https://github.com/PedroAugustoMorais/Projeto1React_PedroAugusto_FullStack.git
```

Ou, no GitHub, selecione **Code → Download ZIP** e extraia o arquivo.

### 2. Abrir a pasta

Abra a pasta do projeto no VS Code. Em seguida, abra um terminal nessa pasta, onde está o arquivo `package.json`.

Se utilizou o comando de clonagem, entre na pasta com:

```bash
cd Projeto1React_PedroAugusto_FullStack
```

### 3. Instalar as dependências

```bash
npm ci
```

Esse comando instala as dependências conforme as versões registradas no `package-lock.json`.

### 4. Iniciar a aplicação

```bash
npm run dev
```

Abra no navegador o endereço **Local** exibido no terminal, normalmente:

http://localhost:5173

Mantenha o terminal aberto enquanto utiliza a aplicação. Para encerrar o servidor, pressione **Ctrl + C**.

O catálogo precisa de internet para consultar o Wikidata. Não abra o `index.html` diretamente: utilize o endereço fornecido pelo Vite.

### Outros comandos

Executar os testes automatizados:

```bash
npm test
```

Gerar a versão de produção na pasta `dist`:

```bash
npm run build
```

Visualizar localmente a versão de produção, após executar o build:

```bash
npm run preview
```

O comando `preview` permite conferir o build no computador; ele não publica a aplicação na internet.

## API pública utilizada

**Wikidata / MediaWiki Action API** — https://www.wikidata.org/w/api.php

- Documentação: https://www.mediawiki.org/wiki/Wikibase/API
- Acesso aos dados: https://www.wikidata.org/wiki/Wikidata:Data_access
- Não exige chave para essas consultas públicas.

O serviço `src/services/instruments.js` usa `wbgetentities` para buscar os nomes e descrições de oito instrumentos. O parâmetro `format=json` solicita JSON; `languages=pt|en` prioriza português; `languagefallback=1` permite inglês quando não há tradução; `origin=*` permite a leitura pelo frontend via CORS.

Exemplo executável:

```text
https://www.wikidata.org/w/api.php?action=wbgetentities&ids=Q31561%7CQ78987%7CQ46185%7CQ1343007%7CQ128309%7CQ8355%7CQ11405%7CQ9798&props=labels%7Cdescriptions&languages=pt%7Cen&languagefallback=1&format=json&origin=*
```

| Identificador | Instrumento |
| --- | --- |
| Q31561 | Guitarra acústica, apresentada como Violão |
| Q78987 | Guitarra elétrica |
| Q46185 | Baixo |
| Q1343007 | Teclado eletrônico |
| Q128309 | Bateria |
| Q8355 | Violino |
| Q11405 | Flauta |
| Q9798 | Saxofone |

**Integração real:** o catálogo é construído somente depois que os dados remotos são recebidos. Os nomes e descrições da fonte ficam visíveis nos detalhes. A configuração local acrescenta categoria, kit, ilustração, diária e estoque fictícios. O apelido comercial “Violão” é local; o nome original da API continua disponível nos detalhes.

Não existe catálogo de fallback que esconda falhas de rede. Se a consulta falhar, a aplicação mostra uma mensagem e permite tentar novamente. A requisição tem timeout de 20 segundos e é cancelada quando deixa de ser necessária.

## Como o useReducer funciona

O `RentalProvider` disponibiliza o estado e as ações pela Context API. O reducer recebe uma ação e retorna um novo estado sem alterar o anterior.

| Ação | Resultado |
| --- | --- |
| FETCH_START / FETCH_SUCCESS / FETCH_ERROR | Atualiza o estado da consulta e o catálogo |
| ADD_ITEM | Adiciona uma unidade respeitando o estoque total |
| DECREASE_ITEM / REMOVE_ITEM / CLEAR_CART | Atualiza a seleção |
| CONFIRM_RESERVATION | Valida, cria o histórico, calcula o total e limpa a seleção |
| CANCEL_RESERVATION | Altera o status e libera as unidades no período |
| SET_VIEW | Troca a seção exibida dentro da SPA |
| STORAGE_ERROR | Exibe aviso quando não é possível persistir os dados |

## Regras da simulação

- Retirada deve ser hoje ou em uma data futura.
- A devolução deve ser posterior à retirada.
- A data de devolução é exclusiva: retirar dia 10 e devolver dia 12 corresponde a **2 diárias**.
- O total é `soma(diária × quantidade) × dias`.
- O período máximo é de 30 diárias.
- A disponibilidade considera o pico de unidades reservadas simultaneamente no período, neste navegador.
- Reservas canceladas deixam de ocupar estoque. Uma devolução no dia da nova retirada não gera sobreposição.
- Nenhum pagamento, comunicação por e-mail, entrega ou aluguel real é realizado.
- Não há backend ou sincronização entre dispositivos. Os dados são locais ao navegador; limpar os dados do site apaga as simulações. Use nome e e-mail fictícios ao apresentar.

## Estrutura

```text
src/
  components/        telas, seleção, detalhes e ilustrações
  contexts/          Context API, reducer e regras de aluguel
  data/              configuração fictícia de kits, preços e estoque
  services/          consulta e transformação do JSON da API
  main.jsx           ponto de entrada, tema e providers
  styles.css         identidade visual e responsividade
tests/               testes com node:test
docs/                informações para entrega
```


## Verificação

Durante a preparação do pacote:

- 15 testes automatizados passaram: API, datas, total, quantidades, sobreposição, cancelamento, persistência e geração de identificadores em HTTP Network.
- O build de produção foi gerado com Vite.
- A consulta HTTP à API pública foi testada com os oito identificadores e o cabeçalho CORS foi conferido.


## Uso de ferramentas de apoio e IA

**ChatGPT / Codex** foi utilizado para apoiar a definição do escopo, a escolha e verificação da API, a geração da base React, dos componentes e ilustrações SVG, das regras de reserva, dos testes e desta documentação.

O código foi produzido com auxílio de IA. 
