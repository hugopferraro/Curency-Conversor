# Revisão do código e da documentação

## 1. Identificação

- **Projeto:** Conversor de Moedas
- **Data da revisão:** 25/09/2026
- **Escopo:** aplicação Next.js, autenticação, conversão, histórico, banco de dados, testes e documentação
- **Documentos de referência:** `docs/Acceptance Criteria.md` e `docs/Technical Documentation.md`
- **Resultado:** aprovado com recomendações de melhoria

## 2. Objetivo

Esta revisão verifica se o código e a documentação estão coerentes com os critérios de aceitação definidos para o produto. Também registra riscos técnicos, oportunidades de manutenção e melhorias sugeridas para entregas futuras.

A revisão considera:

- organização e responsabilidades dos módulos;
- comportamento funcional da interface e do backend;
- autenticação, autorização, segurança e privacidade;
- persistência e integridade dos dados;
- tratamento de falhas e experiência do usuário;
- cobertura e confiabilidade dos testes;
- clareza, consistência e rastreabilidade da documentação.

## 3. Resumo executivo

A solução está funcional e apresenta uma arquitetura adequada ao porte atual do produto. As responsabilidades estão separadas por funcionalidade, o acesso a banco e serviços externos está restrito ao servidor, e as operações privadas validam a sessão no backend.

Não foram encontrados defeitos críticos que impeçam a entrega. Os fluxos principais de cadastro, login, conversão, histórico, reutilização, exclusão e logout foram validados. A suíte também verifica contratos, precisão decimal, integração com o provedor, políticas de autenticação e regras arquiteturais.

As melhorias de maior prioridade são preventivas:

1. impedir que testes de integração sejam executados acidentalmente contra um banco de desenvolvimento ou produção;
2. tratar exceções de rede nos formulários de autenticação e apresentar retorno no logout;
3. validar variáveis de ambiente de forma centralizada no início da aplicação;
4. substituir verificações estruturais baseadas em texto por contratos exportados ou testes de comportamento sempre que possível;
5. tornar a matriz de rastreabilidade individual por critério de aceitação.

## 4. Evidências da revisão

Na revisão atual, foram executadas as seguintes validações:

| Verificação | Resultado |
| --- | --- |
| Testes unitários e de componentes | 118 testes aprovados em 23 arquivos |
| Integração de autenticação | Aprovada |
| Integração de conversão e histórico | Aprovada |
| E2E desktop | Aprovado |
| E2E móvel | Aprovado |
| ESLint | Sem erros |
| TypeScript | Sem erros |
| Build de produção | Concluído com sucesso |

Os dois testes marcados como ignorados na execução E2E são duplicações intencionalmente excluídas: o fluxo completo pertence ao projeto desktop e o cenário de navegação móvel pertence ao projeto mobile.

## 5. Revisão do código

### 5.1. Pontos positivos

#### Arquitetura

- O projeto usa Server Components por padrão e Client Components somente onde há interação.
- As funcionalidades estão organizadas em `features/auth`, `features/currency` e `features/history`.
- Banco, autenticação, serviços e repositórios não são acessados diretamente pelos componentes.
- Os módulos sensíveis usam `server-only`.
- O backend é exposto por Route Handlers HTTP, sem Server Actions ou Server Functions.
- O contexto tRPC resolve a sessão uma vez por requisição e distingue procedimentos públicos e protegidos.

#### Autenticação e segurança

- Better Auth centraliza credenciais, sessões, cookies e rate limit.
- A senha é armazenada como hash na conta técnica, e não na tabela principal de usuários.
- Cookies são configurados como `HttpOnly`, `SameSite=Lax` e `Secure` em produção.
- Login e cadastro possuem limites persistidos no PostgreSQL.
- Mensagens de credenciais inválidas não revelam se o e-mail existe.
- Endpoints fora do escopo de gestão da conta estão desabilitados.
- O logout limpa o cache do TanStack Query, removendo dados privados da interface.

#### Conversão e histórico

- O cálculo usa `decimal.js`, evitando erros de ponto flutuante nativo.
- Valores monetários e taxas são transportados como strings.
- A taxa cruzada é derivada corretamente da matriz com base USD.
- O `requestId` fornece idempotência por usuário.
- Consultas e exclusões do histórico incluem o identificador do usuário.
- A paginação usa `createdAt` e `id`, produzindo uma ordem estável.
- O provedor externo está abstraído por uma interface e pode ser substituído em testes.

#### Interface e acessibilidade

- A interface usa Material UI de forma consistente.
- Campos possuem rótulos e mensagens próximas aos controles.
- Resultados e erros relevantes usam `aria-live`.
- Controles por ícone possuem nomes acessíveis, enquanto ícones decorativos são ignorados.
- O layout possui regras para largura mínima, toque adequado e movimento reduzido.
- Os rótulos do seletor de moedas estão localizados em português.

#### Testes

- Regras matemáticas, limites, arredondamento e transformação de payloads possuem testes unitários.
- Formulários, cabeçalho, conversor e histórico possuem testes de componentes.
- Autenticação e histórico são exercitados contra PostgreSQL.
- A API externa é substituída por um servidor mock nos testes E2E.
- A suíte cobre desktop e viewport móvel.

### 5.2. Melhorias recomendadas

#### Prioridade alta — banco exclusivo para testes

Os scripts de integração usam a variável `DATABASE_URL`. Apesar de criarem registros identificáveis e executarem limpeza, uma configuração incorreta pode apontar para um banco compartilhado ou de produção.

**Sugestão:** exigir uma variável separada, como `TEST_DATABASE_URL`, e interromper a execução quando o nome do banco não indicar explicitamente um ambiente de teste. A limpeza deve continuar limitada aos identificadores criados pela própria execução.

**Benefício:** reduz o risco de alteração acidental de dados reais e atende de forma mais forte ao critério que exige banco separado para testes.

#### Prioridade alta — falhas excepcionais na autenticação

Os formulários tratam respostas com `response.error`, mas não possuem `try/catch` ao redor de `authClient.signIn.email` e `authClient.signUp.email`. Uma falha de rede, resposta interrompida ou exceção inesperada pode resultar em uma rejeição sem mensagem clara para o usuário.

O logout também encerra corretamente o estado de carregamento, mas não apresenta feedback quando falha.

**Sugestão:** criar um pequeno adaptador de autenticação no cliente que normalize sucesso, erro conhecido e indisponibilidade. Login, cadastro e logout devem apresentar mensagens públicas distintas, sem incluir detalhes internos.

**Benefício:** melhora a recuperação diante de instabilidade e evita falhas silenciosas.

#### Prioridade alta — validação centralizada das variáveis de ambiente

As variáveis são lidas diretamente em diferentes módulos. Algumas falhas são detectadas somente quando o módulo é carregado ou quando uma funcionalidade é usada.

**Sugestão:** criar um módulo `server-only` com schema Zod para validar `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, origens confiáveis e `FREECURRENCY_API_KEY`. A aplicação deve falhar cedo com uma mensagem operacional segura quando a configuração estiver incompleta.

**Benefício:** evita configurações parcialmente válidas e reduz diferenças entre desenvolvimento, testes e produção.

#### Prioridade média — validar preferências locais contra o catálogo

O par salvo no `localStorage` é aceito quando possui três letras maiúsculas. Uma moeda removida do catálogo ainda pode ser restaurada e só falhar no momento da conversão.

**Sugestão:** depois que `currency.list` carregar, confirmar que as duas moedas existem no catálogo. Caso contrário, remover a preferência e voltar para BRL → USD.

**Benefício:** evita um estado inicial inválido causado por dados antigos ou alterados manualmente.

#### Prioridade média — reduzir fragilidade dos testes estruturais

Parte de `acceptance-architecture.test.ts` verifica políticas procurando trechos literais no código-fonte. Esses testes são úteis como proteção inicial, mas podem falhar após uma refatoração equivalente ou continuar passando sem validar o comportamento real.

**Sugestão:** exportar políticas imutáveis de autenticação, cache e paginação de módulos puros e testá-las diretamente. Manter inspeção textual somente para regras realmente estruturais, como ausência de `"use server"` e presença de `server-only`.

**Benefício:** testes menos frágeis e com mensagens de falha mais significativas.

#### Prioridade média — ciclo de vida de registros operacionais

A tabela `rate_limits` pode acumular chaves antigas. Sessões expiradas também podem permanecer no banco conforme o comportamento de manutenção do Better Auth.

**Sugestão:** definir uma rotina periódica e documentada para remover rate limits antigos e sessões expiradas, com métricas da quantidade removida.

**Benefício:** limita crescimento do banco e mantém consultas operacionais previsíveis.

#### Prioridade média — confiança nos cabeçalhos de IP

O rate limit usa `x-forwarded-for` e `x-real-ip`. Esses cabeçalhos só representam o cliente real quando são substituídos por um proxy confiável.

**Sugestão:** documentar a topologia de produção e configurar o proxy para remover valores enviados pelo cliente antes de adicionar o IP verificado. Se a hospedagem fornecer um cabeçalho próprio, priorizá-lo.

**Benefício:** impede que um cliente contorne o rate limit forjando o próprio IP.

#### Prioridade média — observabilidade estruturada

Os erros de desenvolvimento são registrados no console e a produção evita imprimir o objeto completo. Ainda não existe correlação entre requisições, métricas de falha do provedor ou monitoramento de latência.

**Sugestão:** adicionar logs estruturados no servidor com `requestId`, rota, categoria de erro e duração, aplicando uma lista explícita de campos permitidos. Senhas, tokens, cookies e chaves nunca devem ser incluídos.

**Benefício:** facilita diagnóstico em produção sem comprometer dados sensíveis.

#### Prioridade baixa — atualização otimista do histórico

Exclusões e limpeza invalidam a consulta e aguardam uma nova leitura do servidor. O comportamento é correto, porém pode parecer lento em conexões com maior latência.

**Sugestão:** considerar atualização otimista do cache com rollback em erro.

**Benefício:** resposta visual imediata, mantendo consistência em caso de falha.

#### Prioridade baixa — resiliência da taxa em cache

Quando o cache expira e o provedor está indisponível, a conversão falha mesmo que exista uma taxa anterior conhecida.

**Sugestão:** avaliar, conforme as regras do produto, a manutenção de uma última taxa válida com indicação explícita de que o dado está desatualizado. Essa mudança só deve ser feita com um limite máximo de idade aprovado.

**Benefício:** aumenta disponibilidade sem apresentar a taxa antiga como atual.

## 6. Revisão dos testes

### 6.1. Cobertura atual

A estratégia de testes está distribuída adequadamente:

- **unitários:** validação, normalização, cálculo, arredondamento, transformação e políticas puras;
- **componentes:** formulários, estados visuais, acessibilidade, histórico e cabeçalho;
- **integração:** Better Auth, PostgreSQL, idempotência, paginação e isolamento entre usuários;
- **E2E:** jornada principal desktop e navegação móvel.

### 6.2. Melhorias sugeridas para os testes

1. Adicionar um limite mínimo de cobertura no Vitest, inicialmente para linhas e branches dos módulos de regras de negócio.
2. Incluir verificação automatizada de acessibilidade com uma ferramenta como `axe-core`, mantendo os testes semânticos existentes.
3. Criar testes de integração para os limites exatos: quinta e sexta tentativa de login, terceira e quarta tentativa de cadastro e reinicialização da janela.
4. Validar explicitamente o algoritmo/formato do hash ou usar a função oficial de verificação do Better Auth no teste, além de confirmar que ele difere da senha original.
5. Exercitar concorrência de duas requisições com o mesmo `requestId`, garantindo a idempotência também sob corrida.
6. Adicionar um cenário E2E para zoom de 200% e navegação completa somente por teclado.
7. Adicionar testes para falha de rede em login, cadastro e logout após a implementação do tratamento sugerido.
8. Executar lint, TypeScript, testes, integrações e build em CI para cada pull request.

## 7. Revisão da documentação

### 7.1. Pontos positivos

- Os critérios de aceitação descrevem claramente escopo, conversão, autenticação, histórico, arquitetura, acessibilidade e segurança.
- A documentação técnica explica o fluxo de login e inclui diagramas Mermaid.
- Tabelas descrevem contratos HTTP, componentes, banco e variáveis de ambiente.
- A documentação diferencia campos do produto de campos técnicos exigidos pelo Better Auth.
- A seção de testes explica os níveis de validação e aponta os arquivos responsáveis.
- O README apresenta configuração local e comandos essenciais.

### 7.2. Melhorias sugeridas para a documentação

#### Identificadores para critérios de aceitação

Os critérios são organizados por seção, mas não possuem identificadores únicos.

**Sugestão:** numerar cada requisito, por exemplo `AUTH-01`, `CUR-04`, `HIST-07` e `A11Y-03`, e usar esses códigos nos nomes ou descrições dos testes.

**Benefício:** permite comprovar a cobertura individual e localizar rapidamente requisitos afetados por uma mudança.

#### Matriz de rastreabilidade individual

A documentação técnica mapeia grupos de critérios, mas alguns itens continuam agregados por seção.

**Sugestão:** manter uma tabela com uma linha por identificador contendo implementação, teste automatizado, nível do teste e situação (`coberto`, `manual`, `pendente` ou `não aplicável`).

**Benefício:** evita que a cobertura de uma seção seja interpretada como cobertura automática de todos os seus itens.

#### Procedimento seguro para testes de integração

O README informa que os testes usam `DATABASE_URL`, mas não destaca suficientemente o risco de apontar para um banco com dados importantes.

**Sugestão:** após a adoção de `TEST_DATABASE_URL`, documentar a criação do banco de teste, migração, execução e limpeza. Incluir um aviso explícito para nunca usar a URL de produção.

#### Configuração de produção

As variáveis necessárias estão descritas, mas falta um checklist de implantação.

**Sugestão:** adicionar uma seção com HTTPS obrigatório, segredo exclusivo, origens confiáveis, proxy de IP, execução de migrações, política de backup e verificação de conectividade com PostgreSQL e FreecurrencyAPI.

#### Versionamento e manutenção

Os documentos não indicam versão, responsável ou histórico de alterações.

**Sugestão:** adicionar cabeçalho com versão do documento, data da última revisão e referência ao commit ou release correspondente.

**Benefício:** torna possível saber se a documentação representa a versão implantada.

## 8. Plano de melhoria sugerido

| Ordem | Ação | Prioridade | Esforço estimado |
| --- | --- | --- | --- |
| 1 | Introduzir `TEST_DATABASE_URL` e proteção contra banco não destinado a testes | Alta | Baixo |
| 2 | Tratar exceções de rede em login, cadastro e logout | Alta | Baixo |
| 3 | Centralizar e validar variáveis de ambiente | Alta | Médio |
| 4 | Identificar critérios e criar matriz individual de rastreabilidade | Média | Médio |
| 5 | Substituir testes textuais de políticas por constantes/contratos testáveis | Média | Médio |
| 6 | Testar limites reais de rate limit e concorrência do `requestId` | Média | Médio |
| 7 | Adicionar CI com todas as verificações obrigatórias | Média | Médio |
| 8 | Adicionar auditoria automática de acessibilidade | Média | Baixo |
| 9 | Definir limpeza periódica de sessões e rate limits | Média | Médio |
| 10 | Avaliar atualização otimista e fallback controlado de taxas | Baixa | Médio |

## 9. Conclusão

O projeto atende à arquitetura e aos fluxos essenciais definidos para a entrega. A separação entre interface, serviços, repositórios e transporte está clara, e a cobertura automatizada fornece boa proteção contra regressões.

A aprovação é feita com recomendações, sem bloqueadores imediatos. Antes de uma implantação com dados reais, recomenda-se priorizar o isolamento obrigatório do banco de testes, a validação centralizada das variáveis de ambiente, o tratamento de falhas excepcionais de autenticação e a configuração confiável dos cabeçalhos de IP. As demais sugestões podem ser incorporadas de forma incremental conforme a evolução do produto.
