# Validação do projeto

Verificações realizadas em 23/10/2026:

- Build de produção do Vite concluído.
- 12 testes automatizados de câmera, galeria, permissões e cancelamento aprovados.
- `npx cap sync android` concluído com reconhecimento de `@capacitor/camera@6.1.3`.
- Arquivos XML do projeto Android analisados sem erro de sintaxe.
- Teste funcional no Chromium: importação real de arquivo pelo seletor web e prévia carregada.
- Captura pela câmera web via PWA Elements, usando dispositivo de vídeo simulado no navegador de testes: captura, confirmação e prévia carregada.
- Cancelamento da câmera web preservando título, autor e capa anterior; nova seleção continua disponível.
- Cancelamento do seletor simulado por evento `cancel`: mensagem exibida, campos e capa anterior preservados, nova tentativa liberada.
- Cadastro persistido no IndexedDB, seguido de recarga e confirmação de que a capa continuava carregando.
- Edição, busca, detalhes, confirmação/cancelamento de exclusão e persistência da exclusão verificados.
- Preferência de tema preservada após recarga.
- Navegação dos três universos por abas, setas e teclado; troca sincronizada da paleta.
- Seleção da capa de um livro real do acervo para o destaque de seu gênero e abertura de detalhes pelo destaque.
- Movimento de camadas com o mouse e cursor circular em computador.
- Gesto horizontal de troca de universo verificado com eventos de toque do navegador móvel.
- Modo de redução de movimento verificado: cursor personalizado e chuva desativados.
- Layout sem rolagem horizontal nas larguras 320, 360, 390, 768, 1024 e 1440 pixels; versões desktop e celular também inspecionadas visualmente.
- Nenhum erro JavaScript não tratado observado durante o teste funcional.
- YAML do GitHub Actions analisado e scripts de shell verificados com `bash -n`.
- ZIP extraído em uma pasta limpa; `npm ci` e `npm run android:sync` concluídos a partir do pacote de entrega, regenerando os arquivos web e nativos necessários.

**Limite da validação:** não foi realizada compilação do APK, execução em um aparelho Android físico nem execução do workflow remoto do GitHub. O projeto nativo e o workflow estão incluídos para essas etapas. A gravação no smartphone, exigida na entrega, deve ser feita pelo aluno.

Execute `npm test` para repetir os testes de lógica e `npm run android:open` para instalar e verificar o recurso nativo no seu aparelho.
