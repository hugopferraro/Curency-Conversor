# Critérios de Aceitação — Conversor de Moedas

## 1. Objetivo do produto

O sistema deve permitir que visitantes e usuários autenticados convertam valores entre moedas de forma simples, confiável e responsiva, utilizando taxas de câmbio atualizadas e informando claramente a origem e o horário dos dados exibidos.

## 2. Conversão de moedas

- O conversor deve permitir que o usuário selecione uma moeda de origem e uma moeda de destino.
- A lista de moedas deve exibir, no mínimo, o código ISO 4217 e o nome de cada moeda.
- O sistema deve oferecer uma lista pesquisável quando a quantidade de moedas tornar a seleção manual pouco prática.
- O usuário deve ser capaz de inserir a quantidade da moeda de origem.
- O campo de valor deve aceitar números inteiros e decimais maiores que zero.
- O campo de valor deve aceitar vírgula ou ponto como separador decimal e normalizar a entrada antes da conversão.
- O campo de valor não deve aceitar letras, valores negativos, `NaN`, infinito ou caracteres inválidos.
- O sistema deve informar claramente quando o valor inserido for inválido ou estiver vazio.
- O conversor deve exibir o valor equivalente na moeda de destino.
- O resultado deve identificar claramente a moeda de origem, a moeda de destino e seus respectivos códigos.
- O resultado deve apresentar, no mínimo, duas casas decimais.
- O sistema deve preservar casas decimais adicionais quando elas forem relevantes para moedas ou valores de pequena magnitude.
- Os resultados devem ser arredondados corretamente de acordo com regras matemáticas de arredondamento.
- O cálculo deve utilizar precisão decimal suficiente para evitar erros perceptíveis causados por ponto flutuante.
- A taxa aplicada deve ser exibida no formato `1 MOEDA_ORIGEM = X MOEDA_DESTINO`.
- O usuário deve conseguir inverter as moedas de origem e destino por meio de uma única ação.
- Ao inverter as moedas, o sistema deve recalcular o resultado imediatamente com a nova taxa.
- O sistema não deve permitir que a conversão seja executada com a mesma moeda na origem e no destino sem informar que os valores são equivalentes.
- Alterações no valor ou nas moedas selecionadas devem atualizar o resultado sem exigir recarregamento da página.
- Durante o processamento, a interface deve apresentar um indicador de carregamento e impedir solicitações duplicadas acidentais.

## 3. Taxas de câmbio

- As taxas devem ser obtidas de uma fonte externa confiável e configurada no servidor.
- Chaves, tokens ou credenciais do provedor de câmbio não devem ser expostos ao navegador.
- A interface deve informar a data e o horário da última atualização da taxa utilizada.
- A interface deve deixar claro que a taxa exibida é informativa e pode divergir das taxas praticadas por bancos, corretoras ou operadoras de cartão.
- O sistema deve tratar indisponibilidade, limite de requisições e respostas inválidas do provedor de câmbio.
- Quando não for possível obter uma taxa válida, o sistema não deve exibir um resultado calculado com dados incompletos.
- Em caso de falha, o usuário deve receber uma mensagem compreensível e uma opção para tentar novamente.
- Caso taxas sejam armazenadas em cache, o prazo de validade deve ser definido e o horário original da taxa deve permanecer visível.
- O sistema não deve apresentar uma taxa expirada como atual sem sinalizar essa condição ao usuário.

## 4. Cadastro e autenticação

- Um visitante deve conseguir acessar o conversor e realizar conversões sem criar uma conta.
- Um visitante deve conseguir acessar as telas de cadastro e login por meio de links claramente identificados.
- O cadastro deve solicitar, no mínimo, nome, e-mail e senha.
- O e-mail deve ser validado quanto ao formato e normalizado antes de ser armazenado.
- Não deve ser possível cadastrar mais de uma conta com o mesmo e-mail, desconsiderando diferenças entre letras maiúsculas e minúsculas.
- A senha deve possuir no mínimo oito caracteres.
- A interface deve informar os requisitos da senha antes do envio do cadastro.
- A confirmação de senha deve ser idêntica à senha informada.
- Após um cadastro válido, o sistema deve autenticar o usuário ou direcioná-lo claramente para o login.
- O usuário deve conseguir entrar utilizando e-mail e senha válidos.
- Credenciais inválidas devem produzir uma mensagem genérica que não revele se o e-mail está cadastrado.
- O formulário de login deve impedir múltiplos envios enquanto a autenticação estiver em andamento.
- A senha deve permanecer mascarada por padrão, com uma opção acessível para mostrar ou ocultar seu conteúdo.
- O usuário autenticado deve permanecer conectado após atualizar a página enquanto sua sessão for válida.
- O usuário deve conseguir encerrar a sessão por meio de uma ação claramente identificada.
- Após o logout, páginas e dados restritos não devem continuar acessíveis pela sessão encerrada.
- Senhas nunca devem ser armazenadas ou registradas em texto puro.
- Cookies de sessão devem utilizar as proteções `HttpOnly`, `Secure` em produção e uma política `SameSite` apropriada.
- Rotas protegidas devem validar a sessão no servidor, independentemente do estado exibido pelo cliente.
- O sistema deve limitar ou retardar tentativas repetidas de autenticação para reduzir ataques de força bruta.

## 5. Perfil e sessão do usuário

- O usuário autenticado deve conseguir visualizar seu nome e e-mail cadastrados.
- O usuário deve conseguir alterar seu nome por meio de uma operação autenticada.
- Se a alteração de e-mail for permitida, o novo endereço deve ser validado e não pode pertencer a outra conta.
- Se a alteração de senha for permitida, o sistema deve exigir a senha atual ou outro mecanismo seguro de confirmação.
- Mensagens de sucesso ou erro devem confirmar claramente o resultado das alterações de perfil.
- Dados pertencentes a um usuário não devem ser visíveis ou modificáveis por outro usuário.

## 6. Histórico e preferências

- O histórico persistente deve estar disponível apenas para usuários autenticados.
- Uma conversão salva deve registrar o valor original, as moedas, a taxa utilizada, o resultado e a data e horário.
- O usuário deve conseguir consultar seu histórico em ordem cronológica, iniciando pelos registros mais recentes.
- O histórico deve pertencer exclusivamente ao usuário que realizou as conversões.
- O usuário deve conseguir reutilizar uma conversão anterior no conversor.
- O usuário deve conseguir excluir um item do histórico.
- Antes de apagar todo o histórico, o sistema deve solicitar confirmação explícita.
- O sistema deve informar quando o histórico estiver vazio.
- Preferências como moedas usadas recentemente ou par favorito devem ser restauradas para o usuário autenticado quando tecnicamente disponíveis.

## 7. Interface e experiência do usuário

- A página inicial deve apresentar o conversor como ação principal, sem exigir navegação adicional.
- A interface deve possuir hierarquia visual clara entre entrada, seleção de moedas, ação de conversão e resultado.
- Todos os botões e campos devem possuir rótulos claros em português.
- A interface deve informar visualmente qual campo está em foco.
- A ação de inverter moedas deve possuir texto acessível, mesmo quando representada visualmente por um ícone.
- Estados de carregamento, sucesso, vazio e erro devem ser visualmente distintos.
- Mensagens de validação devem aparecer próximas ao campo relacionado e explicar como corrigir o problema.
- O layout deve funcionar sem rolagem horizontal em larguras a partir de 320 pixels.
- A aplicação deve ser utilizável em celulares, tablets e computadores.
- Elementos interativos devem possuir área de toque adequada em dispositivos móveis.
- A interface não deve perder dados já preenchidos devido a uma falha recuperável da API.
- A navegação deve indicar quando o usuário está autenticado e disponibilizar acesso ao perfil, histórico e logout.
- A aplicação deve possuir título e descrição de página coerentes com um conversor de moedas.

## 8. Acessibilidade

- Toda funcionalidade deve ser operável por teclado.
- A ordem de foco deve acompanhar a ordem visual e lógica da interface.
- Campos de formulário devem estar associados programaticamente aos seus rótulos.
- Erros de validação devem ser anunciados por tecnologias assistivas.
- Atualizações do resultado da conversão devem ser anunciadas sem mover o foco inesperadamente.
- Textos e controles devem atender, no mínimo, ao contraste definido pelo nível AA das WCAG 2.2.
- A interface não deve depender exclusivamente de cor para transmitir informação.
- Ícones decorativos devem ser ignorados por leitores de tela; ícones funcionais devem possuir nome acessível.
- O zoom de até 200% não deve impedir o uso das funcionalidades principais.
- Animações devem respeitar a preferência do sistema por movimento reduzido.

## 9. Segurança e privacidade

- Toda entrada recebida pelas APIs deve ser validada no servidor, mesmo que já tenha sido validada no navegador.
- Operações autenticadas devem rejeitar sessões ausentes, inválidas ou expiradas.
- Mensagens e logs não devem expor senhas, tokens, cookies, chaves de API ou informações sensíveis.
- Erros internos não devem retornar detalhes de implementação ou rastros de pilha em produção.
- Consultas ao banco de dados devem ser parametrizadas ou construídas por APIs que evitem injeção de SQL.
- A aplicação deve aplicar proteção adequada contra XSS, CSRF e abuso de endpoints.
- Endpoints públicos sujeitos a abuso devem possuir limitação de requisições quando necessário.
- A coleta e retenção de dados pessoais devem se limitar ao necessário para as funcionalidades oferecidas.
- O usuário deve ser informado sobre dados pessoais armazenados e sua finalidade.

## 10. API e integridade dos dados

- As funcionalidades de servidor devem ser expostas por Route Handlers HTTP; Server Functions e Server Actions não devem ser utilizados.
- As operações tRPC devem validar suas entradas e retornar erros tipados e coerentes.
- Respostas bem-sucedidas não devem ser retornadas quando uma operação de banco de dados falhar.
- Datas devem ser armazenadas em formato não ambíguo e convertidas para o fuso horário apropriado somente na apresentação.
- Valores monetários e taxas devem ser armazenados com precisão decimal adequada, sem perda causada por tipos binários de ponto flutuante.
- Alterações que envolvam múltiplas gravações dependentes devem utilizar transações no banco de dados.
- A aplicação deve diferenciar erros de validação, autenticação, autorização, recurso não encontrado, conflito e erro interno.

## 11. Desempenho e confiabilidade

- A interface inicial deve permanecer utilizável enquanto dados secundários são carregados.
- Requisições idênticas de taxa de câmbio devem ser reutilizadas ou armazenadas em cache quando isso não comprometer a atualização dos dados.
- O sistema deve evitar conversões duplicadas provocadas por cliques repetidos ou respostas concorrentes.
- Uma resposta antiga não deve substituir o resultado de uma solicitação mais recente.
- Falhas temporárias de rede devem permitir nova tentativa sem exigir que o usuário recarregue toda a aplicação.
- A aplicação deve continuar apresentando uma interface compreensível quando JavaScript, rede ou API estiverem lentos.

## 12. Compatibilidade e qualidade

- A aplicação deve funcionar nas duas versões estáveis mais recentes de Chrome, Edge, Firefox e Safari.
- O projeto deve compilar para produção sem erros de TypeScript.
- O lint do projeto não deve apresentar erros.
- Fluxos críticos de conversão, autenticação e autorização devem possuir testes automatizados.
- Cálculos e arredondamentos devem possuir testes cobrindo valores inteiros, decimais, muito pequenos e muito grandes.
- Os testes devem cobrir respostas inválidas e indisponibilidade do provedor de câmbio.
- Nenhuma funcionalidade existente deve ser considerada concluída enquanto seus estados de carregamento, sucesso, vazio e erro não forem tratados.

## 13. Critério geral de conclusão

Uma funcionalidade será considerada aceita quando:

- atender a todos os critérios aplicáveis deste documento;
- possuir validação no cliente e no servidor quando receber dados do usuário;
- apresentar feedback compreensível em caso de sucesso ou falha;
- funcionar em dispositivos móveis e desktop;
- não introduzir erros de compilação, tipagem ou lint;
- possuir testes proporcionais ao risco da funcionalidade;
- não expuser dados sensíveis nem permitir acesso indevido a dados de outros usuários.
