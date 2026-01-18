Funcionalidades Obrigatórias

- [x] 1. Cadastro de Usuários (Backend)
● Descrição: O sistema deve permitir que novos usuários se cadastrem através de uma rota de API.
● Requisitos:
○ Deve haver uma rota para cadastro de usuários.
○ O usuário deve fornecer nome, username e senha no cadastro.
○ Os dados do usuário devem ser armazenados em um banco de dados MongoDB.
○ A rota deve retornar um feedback de sucesso ou falha no cadastro.

- [x] 2. Autenticação de Usuário (Backend)
● Descrição: O sistema deve permitir que os usuários autenticados acessem a aplicação.
● Requisitos:
○ Deve haver uma rota para realizar o login.
○ Deve ser possível autenticar usando um usuário e senha cadastrados.
○ De preferência ao uso da biblioteca Passport.js para controlar o acesso dos usuários a rotas públicas/privadas.

- [ ] 3. Tela de Login (Frontend)
● Descrição: O sistema deve conter uma interface de login para que os usuários cadastrados possam acessar a aplicação.
● Requisitos:
○ Deve ser implementada uma página de login;
○ O usuário deve informar o username e password para se autenticar;
○ Deve haver validação dos dados e feedback de erros para o usuário;
○ Caso a autenticação seja bem-sucedida, o usuário deve ser redirecionado para o chat;
○ Em caso de erro, o usuário deve ser informado do problema.

- [x] 4. Chat em Tempo Real (Backend + Frontend)
● Descrição: O sistema deve permitir que os usuários logados possam trocar mensagens em tempo real com outros usuários cadastrados.
● Requisitos:
○ O chat deve ser implementado utilizando websockets para a troca de mensagens em tempo real;
○ As mensagens devem ser armazenadas no banco de dados MongoDB para garantir a durabilidade;
○ O frontend deve exibir uma interface de chat onde o usuário pode enviar e receber mensagens;
○ As mensagens enviadas por um usuário devem ser imediatamente visíveis para o outro usuário participante da conversa.

- [x] 5. Notificações de Novas Mensagens (Backend + Frontend)
● Descrição: O sistema deve notificar os usuários em tempo real sobre o recebimento de novas mensagens.
● Requisitos:
○ Implementar notificações em tempo real utilizando websockets para novas mensagens recebidas;
○ Notificações devem ser exibidas na interface quando o usuário receber uma mensagem nova.

- [ ] 6. Lista de Usuários Online/Offline (Frontend + Backend)
● Descrição: O sistema deve mostrar o status dos usuários (online/offline) e manter a lista atualizada conforme as ações de login e logout.
● Requisitos:
○ O sistema deve exibir uma lista de usuários mostrando seu status (online ou offline) em tempo real.
○ O status de cada usuário deve ser atualizado automaticamente quando ele realizar o login ou logout.

- [x] 7. Armazenamento de Mensagens (Backend)
● Descrição: As mensagens trocadas entre os usuários devem ser persistidas no banco de dados.
● Requisitos:
○ As mensagens enviadas durante o chat devem ser salvas no banco de dados MongoDB.
○ O Backend deve permitir a consulta das mensagens trocadas entre os usuários.

- [ ] 8. Suporte a Docker (Backend)
● Descrição: O sistema pode ser configurado para rodar em contêineres utilizando Docker.
● Requisitos:
○ Criar um Dockerfile para a aplicação Node.js.
○ Configurar um Docker Compose para subir a aplicação e o banco de dados MongoDB.