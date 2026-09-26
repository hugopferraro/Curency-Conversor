# Critérios de Aceitação — Conversor de Moedas

## 1. Escopo do produto

- A aplicação deve possuir somente as páginas `/`, `/login` e `/register`.
- Visitantes e usuários autenticados devem poder realizar conversões na página inicial.
- O histórico deve aparecer abaixo do conversor em `/`; não deve existir uma página separada de histórico.
- Não devem existir perfil, alteração de dados da conta, recuperação de senha ou verificação de e-mail nesta entrega.
- Para o usuário, uma conta deve ser composta somente por e-mail e senha. Campos técnicos exigidos pela autenticação não devem ser exibidos nem editáveis.

## 2. Conversão de moedas

- O usuário deve selecionar a moeda de origem e a moeda de destino em listas pesquisáveis.
- Cada opção deve exibir o código ISO e o nome da moeda.
- O par inicial deve ser BRL → USD e o último par escolhido deve ser mantido no `localStorage`.
- O usuário deve informar um valor positivo de até `10¹⁵`, com no máximo 18 casas decimais.
- O campo deve aceitar ponto ou vírgula como separador decimal e rejeitar letras, zero, negativos, múltiplos separadores e valores fora do limite.
- A ação de inverter deve trocar as moedas em um único comando e recalcular quando já houver um resultado.
- Conversões entre a mesma moeda devem retornar taxa `1` e valor equivalente.
- Durante uma conversão, campos e ações devem permanecer desabilitados para impedir envios duplicados acidentais.
- O resultado deve mostrar valor de origem, valor convertido, moedas, taxa aplicada, provedor e horário da consulta.
- Valores devem ser calculados com precisão decimal, arredondamento matemático `half-up` e, na apresentação, no mínimo duas casas decimais.
- Valores monetários e taxas devem ser transportados pelas APIs como strings.
- Estados de carregamento, erro e sucesso devem ser visualmente distintos e não devem apagar a entrada após falhas recuperáveis.

## 3. Taxas de câmbio

- As moedas e taxas devem ser obtidas da FreecurrencyAPI exclusivamente no servidor.
- A chave da API deve ser enviada no header `apikey` e nunca exposta ao navegador ou aos logs.
- A lista de moedas deve permanecer em cache por sete dias.
- A matriz de taxas com base USD deve permanecer em cache por 12 horas, e pares devem ser calculados por `USD→destino ÷ USD→origem`.
- A interface deve identificar os dados como taxa de fechamento e mostrar o horário em que foram consultados.
- A interface deve alertar que os valores são informativos e podem divergir dos praticados por instituições financeiras.
- Respostas `401`, `403`, `422`, `429`, timeout, indisponibilidade e payloads inválidos devem gerar mensagens compreensíveis sem revelar detalhes internos.
- Um resultado não deve ser exibido quando não for possível obter uma taxa válida.

## 4. Cadastro, login e sessão

- O cadastro deve solicitar somente e-mail, senha e confirmação da senha.
- O e-mail deve ter formato válido, ser normalizado e ser único sem diferenciar maiúsculas de minúsculas.
- A senha deve ter entre 8 e 128 caracteres, permanecer mascarada por padrão e possuir uma ação acessível para exibição.
- A interface de cadastro deve mostrar o requisito da senha e rejeitar uma confirmação diferente.
- Após o cadastro, o usuário deve ser autenticado e redirecionado para `/`.
- O login deve aceitar e-mail e senha e redirecionar para `/` após sucesso.
- Credenciais inválidas devem produzir uma mensagem genérica que não revele se o e-mail existe.
- Usuários autenticados que acessarem `/login` ou `/register` devem ser redirecionados para `/`.
- A sessão deve durar sete dias e sobreviver a recarregamentos enquanto válida.
- O usuário deve conseguir sair pelo cabeçalho; após o logout, o cache do navegador deve ser limpo e dados privados não devem permanecer visíveis.
- Senhas devem ser armazenadas somente como hash `scrypt` na conta técnica de credenciais.
- Cookies de sessão devem ser `HttpOnly`, `SameSite=Lax` e `Secure` em produção.
- Login deve aceitar no máximo cinco tentativas por minuto/IP e cadastro, três tentativas por minuto/IP, com controle persistido no PostgreSQL.
- Endpoints de alteração de usuário, e-mail, senha, exclusão de conta, recuperação e verificação devem permanecer bloqueados.

## 5. Cabeçalho e navegação

- O cabeçalho deve exibir a marca “Conversor de Moedas” com link para `/`.
- Para visitantes, o cabeçalho deve mostrar “Entrar” e “Criar conta”.
- Para usuários autenticados, deve mostrar apenas o e-mail e a ação “Sair”.
- Não deve haver links de perfil nem de histórico separado.
- As versões móvel e desktop devem ser acessíveis por teclado e tecnologia assistiva.

## 6. Histórico

- Somente usuários autenticados devem visualizar e acessar o histórico.
- Para visitantes, a região abaixo do conversor deve mostrar uma chamada discreta para entrar ou criar uma conta.
- Cada conversão autenticada deve ser salva automaticamente com valores, moedas, taxa, provedor, horário da taxa e horário da conversão.
- O `requestId` deve impedir a duplicação de uma mesma conversão para o mesmo usuário.
- O histórico deve mostrar os registros mais recentes primeiro, com ordenação estável e páginas de 20 itens.
- A ação “Carregar mais” deve acrescentar itens sem recarregar a página.
- “Reutilizar” deve preencher o conversor com os dados anteriores e mover o foco para o campo de valor.
- O usuário deve excluir um item sem recarregar a página.
- A exclusão de todo o histórico deve exigir confirmação explícita.
- O estado vazio deve ser informado claramente.
- Nenhum usuário deve visualizar, excluir ou reutilizar dados pertencentes a outro usuário.
- Todas as operações de histórico devem validar a sessão no servidor, mesmo quando o componente não estiver renderizado.

## 7. API, arquitetura e integridade

- Funcionalidades do servidor devem ser expostas por Route Handlers HTTP; Server Functions e Server Actions não devem ser usados.
- `currency.list` e `currency.convert` devem ser públicos; `history.list`, `history.delete` e `history.clear` devem ser protegidos.
- O contexto tRPC deve resolver a sessão uma única vez por requisição.
- Entradas devem ser validadas no servidor com Zod e erros devem ser traduzidos para contratos públicos coerentes.
- Componentes não devem acessar diretamente banco, segredos ou o provedor externo.
- Repositórios devem concentrar SQL, serviços devem concentrar regras de negócio e routers devem concentrar transporte e autorização.
- Módulos de banco, autenticação e provedores externos devem ser exclusivos do servidor.
- Datas devem ser armazenadas com fuso horário e formatadas somente na apresentação.
- Consultas devem ser parametrizadas e a chave estrangeira do histórico deve apagar seus registros quando o usuário for removido tecnicamente.

## 8. Interface e acessibilidade

- Todos os textos visíveis devem estar em português e o documento deve declarar `lang="pt-BR"`.
- A aplicação deve usar Material UI de forma consistente e possuir tema claro nesta entrega.
- O layout deve ser mobile-first, sem rolagem horizontal a partir de 320 px.
- Campos devem possuir rótulos associados, foco visível e mensagens de erro próximas ao controle correspondente.
- Todas as funções devem ser operáveis por teclado, com ordem de foco lógica e áreas de toque adequadas.
- Mudanças no resultado e erros relevantes devem ser anunciados com `aria-live` sem mover o foco inesperadamente.
- Ícones funcionais devem possuir nome acessível e ícones decorativos devem ser ignorados por leitores de tela.
- A interface não deve depender somente de cor e deve manter contraste WCAG 2.2 AA.
- O zoom de 200% não deve impedir o uso e animações devem respeitar movimento reduzido.
- Metadata, títulos e descrição devem ser coerentes com o produto.

## 9. Segurança e privacidade

- Operações autenticadas devem rejeitar sessões ausentes, inválidas ou expiradas.
- Mensagens e logs não devem expor senha, hash, token, cookie, chave de API ou stack trace em produção.
- A aplicação deve manter as proteções contra CSRF, XSS e validação de origem fornecidas pelo framework e pelo Better Auth.
- A coleta de dados pessoais deve se limitar ao e-mail necessário para autenticação.
- O banco deve armazenar o histórico isolado pelo identificador do usuário.

## 10. Testes e conclusão

- Testes unitários devem cobrir normalização, validação, conversão cruzada, mesma moeda, precisão, arredondamento e transformação de respostas do provedor.
- Testes de integração devem cobrir cadastro, login, sessão, logout, endpoints bloqueados, idempotência e isolamento do histórico.
- Testes de componentes devem cobrir formulários, cabeçalho, estados do conversor, histórico, confirmações e reutilização.
- O fluxo E2E principal deve cobrir cadastro → conversão → histórico → reutilização → exclusão → logout, além da conversão como visitante.
- Testes não devem consumir a quota real: devem usar banco separado e servidor mock da FreecurrencyAPI.
- A entrega deve concluir sem erros de lint, TypeScript, testes ou build de produção.

Uma funcionalidade será considerada aceita somente quando cumprir os critérios aplicáveis, validar entradas no cliente e no servidor, fornecer feedback compreensível, funcionar em mobile e desktop e não permitir exposição ou acesso indevido a dados.
