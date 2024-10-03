# Lista de _scripts_

## Não funcionam mais:

* `lint` - As regras do LINTER estão ultrapassadas e não mais aplicáveis
* `lint-fix` - As regras do LINTER estão ultrapassadas e não mais aplicáveis
* `pretest` - As regras do LINTER estão ultrapassadas e não mais aplicáveis
* `test` - Insiste em conectar com MongoDB local ao invés do servidor de testes
* `test-all` - Por razões óbvias
* `test-e2e` - Está usando um `PATH`incompatível com meu ambiente de desenvolvimento
* `test-e2e-bg` - Não tenho nem pretendo instalar Firefox e Selenium
* `test-e2e-saucelabs` - Não tenho nem pretendo adquirir e configurar conta no Saucelabs (comercial e versão _trial_ muito limitada para estes testes)
* `test-e2e-saucelabs-group` - Não tenho nem pretendo adquirir e configurar conta no Saucelabs (comercial e versão _trial_ muito limitada para estes testes)
* `test-unit` - Mesmo motivo de `pretest` - `test-unit2` foi criado em seu lugar
* `updtr` - **CUIDADO AO EXECUTAR** - Este "teste" atualiza dependências depois executa `test` que como vimos não roda
* `watch` - As regras do LINTER estão ultrapassadas e não mais aplicáveis - `watch2` foi criado sem o LINTER para quem quiser usar
* `pretest-cov` - As regras do LINTER estão ultrapassadas e não mais aplicáveis - usar `clean`, porém sem o LINTER
* `test-cov` - Não funciona porque `test` também não funciona
* `posttest-cov` - Não funciona porque `test-cov` também não funciona


## Funcionam:

* `clean` - só funciona em máquinas *Unix-_like_* com `rimraf` instalado
* `fields-explorer` - **Não é um teste** - Documentação em http://localhost:8080 dos tipos de atributos utilizados (*não cobre internacionalização nem "_upload_" de arquivos*)
* `test-admin` - módulo administrativo (Painel do Administrador)
* `watch2` - atualiza a aplicação quando fontes são atualizados