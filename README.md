# Rara — Livraria & Sebo

**Atividade 12 — Recursos de Hardware: Câmera Nativa · PPDM II**  
**Aluno 11 — Livraria e Sebo Raro**  
Professor: Adriano Rosa Mazetto

Aplicativo React + Vite + Capacitor 6 para cadastrar livros antigos com capas fotografadas com a câmera ou escolhidas da galeria. O projeto Android já está criado, o plugin oficial `@capacitor/camera` está instalado e a compilação pelo GitHub Actions está configurada.

**Para gerar o APK sem Android Studio, comece por `LEIA-PRIMEIRO-APK.md`.**

## O que a atividade pede

No [exercício do aluno 11](https://dm12.pages.dev/#exercicios), o desafio é cadastrar capas de livros antigos importadas da galeria de fotos. Os requisitos específicos são **`CameraSource.Photos` obrigatório** e **`CameraResultType.Uri`**.

| Requisito | Onde está implementado |
| --- | --- |
| Plugin oficial de câmera | `package.json`, `android/app/capacitor.build.gradle` |
| Seleção pela galeria, qualidade 90 | `src/lib/camera.js` → `escolherCapaDaGaleria()` |
| `CameraResultType.Uri` | Opções de `Camera.getPhoto()` no mesmo arquivo |
| Prévia imediata por `image.webPath` | Estado `fotoCapa` e `<img src={fotoCapa.webPath}>` em `src/LivrariaRaraApp.jsx` |
| Estado do React e renderização condicional | Mesmo componente, bloco do seletor de capa |
| Verificação de permissões | `Camera.checkPermissions()` nos dispositivos nativos |
| Pedido de permissão quando necessário | Plugin Android ao escolher Câmera; função `tirarFotoDaCapa()` para captura direta; ramo iOS de fotos |
| AndroidManifest configurado | `android/app/src/main/AndroidManifest.xml` |
| Cancelamento sem travamento | `try/catch/finally` em `escolherGaleria()` |
| Botão volta a funcionar depois do cancelamento | `setCapturando(false)` e liberação do bloqueio no `finally` |

O aplicativo oferece as duas demonstrações. **“Escolher capa na galeria”** usa `CameraSource.Photos`, atendendo ao exercício individual 11. **“Tirar foto / Galeria”** usa `CameraSource.Prompt` no APK, abrindo a escolha nativa entre câmera e fotos. No navegador, essa escolha aparece em uma janela acessível e a captura usa a câmera web pelo PWA Elements.

## O que funciona

- Escolha da capa pelo seletor de fotos do Android; no navegador, pelo seletor de arquivos.
- Foto da capa pela câmera nativa do Android e prévia imediata no aplicativo.
- Câmera web em HTTPS ou localhost, com permissão concedida no navegador.
- Prévia da imagem antes do cadastro, troca e remoção da capa.
- Título, autor, ano, gênero, conservação, valor estimado e observações.
- Cadastro, consulta, edição e exclusão com confirmação.
- Busca por título ou autor; filtro por gênero e ordenação.
- Catálogo persistente no próprio aparelho, incluindo os **bytes das imagens**.
- Interface para celular e computador, modo claro/escuro e mensagens de erro.
- Uso local sem conta, servidor ou Supabase. Não há compra, venda nem cobrança.

Não há dados fictícios no acervo inicial. As capas conceituais dos três universos no topo são ilustrativas. Quando existe um livro cadastrado no gênero correspondente, a capa real dele ocupa o destaque.

## Design atualizado — universos literários

A interface foi refeita seguindo a referência visual “Valorant Characters”, da Yudiz, enviada pelo usuário:

- Destaque em tela cheia com tipografia grande, cortes diagonais e painéis geométricos.
- Três slides: **Fantasia** em roxo, **Clássicos** em laranja e **Poesia** em verde.
- Cores do cabeçalho, botões, cadastro e acervo sincronizadas ao universo selecionado.
- Navegação lateral, setas, teclado e gesto horizontal de toque no destaque.
- Transição de 500 ms, livro em perspectiva, movimento de camadas com o mouse e chuva sutil.
- Cursor circular que reage aos controles em computadores com mouse.
- Layout próprio para celular e modo claro/escuro, com preferência salva.
- Respeito à preferência do sistema por redução de movimento.

Os efeitos foram adaptados para componentes React com eventos e animações CSS. Não dependem de jQuery, Slick, GSAP ou scripts de terceiros. Fontes e recursos visuais estão no próprio projeto. As funções da atividade do aluno 11 continuam usando a galeria do Capacitor.

## 1. Abrir no computador

Instale Node.js 22 LTS (ou uma versão compatível, a partir de 20). Extraia este ZIP e abra o terminal **na pasta que contém `package.json`**.

```bash
npm ci
npm run dev
```

Abra o endereço exibido no terminal, normalmente `http://127.0.0.1:5173`. Toque em **Escolher capa na galeria** e selecione uma imagem.

Para verificar o projeto:

```bash
npm test
npm run build
```

## 2. Abrir no Android físico para entregar

O vídeo da atividade exige um **smartphone físico**. A versão web ajuda a conferir o layout, mas não demonstra a ponte nativa do Capacitor.

1. Instale Android Studio. No SDK Manager, instale Android SDK Platform **34**, Build Tools **34.0.0** e Platform Tools.
2. Use **JDK 17** como Gradle JDK. No Android Studio: Settings → Build, Execution, Deployment → Build Tools → Gradle. Se sua instalação usa um JDK mais novo, selecione/instale o 17 para este projeto Capacitor 6.
3. No celular, ative as opções de desenvolvedor e **Depuração USB**. Conecte ao PC e autorize a depuração na tela do aparelho.
4. Na raiz do projeto, execute:

```bash
npm ci
npm run android:open
```

5. Espere o Gradle terminar de sincronizar. Selecione o celular no Android Studio e clique em **Run ▶**.

Alternativa por linha de comando, com SDK e Java já configurados:

```bash
npm run android:run
```

Após qualquer alteração em React/CSS, rode `npm run android:sync` e execute o app novamente. O script faz **build + `npx cap sync android`**, atualizando arquivos e plugins.

**Não é necessário rodar `npx cap add android`: a pasta `android` já está incluída.**

### Gerar APK local

Com o Android SDK e o Java 17 configurados:

```bash
npm run android:apk
```

O arquivo será copiado para **`apk/Livraria-Rara.apk`**. É uma compilação de depuração para demonstração escolar, não uma versão assinada para publicar na loja.

### Gerar APK pelo GitHub

1. Crie um repositório e envie **todo o conteúdo desta pasta**, inclusive `.github` e `android`. O `package.json` precisa ficar na raiz do repositório.
2. Abra **Actions → Gerar APK da Livraria Rara → Run workflow**. O fluxo também roda automaticamente em qualquer push.
3. Aguarde terminar e baixe o artefato **Livraria-Rara-APK**.
4. Extraia e instale **`Livraria-Rara.apk`** no celular. Se necessário, autorize a instalação pelo aplicativo usado para abrir o APK.

O workflow instala o SDK 34, usa Node.js 22 e Java 17, roda os testes, sincroniza o Capacitor, compila, verifica a assinatura do APK e publica o arquivo em Artifacts. Ele só será executado depois que você enviar o projeto ao seu GitHub. Não exige Supabase, tokens nem secrets.

Se a pasta `.github` não aparecer depois do upload, crie o arquivo `.github/workflows/android-apk.yml` no GitHub e copie o conteúdo de `GERAR-APK.yml`, incluído na raiz como alternativa de fácil acesso.

## 3. Colocar a versão web na Vercel

Envie o conteúdo da pasta para o GitHub e importe o repositório na Vercel.

| Configuração | Valor |
| --- | --- |
| Framework | Vite |
| Install | `npm ci` |
| Build | `npm run build` |
| Output | `dist` |
| Variáveis de ambiente | Nenhuma |

O `vercel.json` já está incluído. No site, a galeria usa o seletor de arquivos e a câmera utiliza PWA Elements; a câmera web exige HTTPS ou localhost e uma webcam disponível. **Para comprovar o recurso nativo, grave a versão Android instalada.**

## 4. Roteiro do vídeo da entrega

Veja **`ENTREGA-ALUNO-11.md`**, com a sequência de demonstração e uma fala curta para explicar o código. Você precisa gravar a tela do **seu próprio celular** e enviar `.mp4` / `.webm` ou o link do vídeo, conforme a tarefa. Este ZIP contém o aplicativo e o roteiro; ele não inclui uma gravação de um aparelho físico.

## 5. Como o código funciona

O ponto central do exercício está em `src/lib/camera.js`:

```js
const image = await Camera.getPhoto({
  quality: 90,
  allowEditing: false,
  resultType: CameraResultType.Uri,
  source: CameraSource.Photos,
  correctOrientation: true,
  saveToGallery: false,
  webUseInput: true,
});
```

O componente chama essa função dentro de `try/catch/finally`. Ao receber a imagem, executa `setFotoCapa(image)`; a tag `<img>` usa `fotoCapa.webPath`. O `catch` apresenta uma mensagem se a seleção for cancelada ou falhar e o `finally` libera o botão. Não há `Base64` como tipo de resultado da câmera.

Ao salvar o livro, `fetch(image.webPath).blob()` lê a imagem e o IndexedDB grava uma cópia binária. Guardar apenas a URI temporária da galeria faria as capas desaparecerem em sessões futuras. Ao abrir o acervo, o app cria URLs locais a partir dos blobs e as libera quando deixam de ser usadas.

### Permissões no Android

O Manifest inclui as permissões de câmera e armazenamento legadas citadas no enunciado, com limites de versão para armazenamento. Ao escolher **Tirar foto** no seletor nativo, o plugin solicita a permissão da câmera quando necessário. O botão direto de galeria não exige câmera. Nos Androids compatíveis, o **Photo Picker autoriza somente a foto escolhida**, sem pedir acesso geral à biblioteca. Nos demais, o plugin usa `ACTION_OPEN_DOCUMENT`. Por isso o seletor de fotos pode aparecer **sem uma janela separada de permissão**. O código não bloqueia a galeria porque uma permissão ampla está negada.

As fontes são empacotadas junto do app. Depois de instalado, o catálogo e a escolha de arquivos locais não dependem de um servidor. Fotos que só existem em serviços de nuvem podem depender da conexão do próprio seletor.

## Armazenamento e limites

- O acervo pertence ao aparelho e à origem do navegador. O APK e o site têm acervos separados.
- Limpar dados, desinstalar o app ou limpar o armazenamento do navegador apaga o acervo. Não há backup nem sincronização.
- Limite de 20 MB por capa; o espaço total depende do dispositivo.
- Valores são estimativas digitadas pelo usuário, sem processamento de pagamentos.
- Projeto preparado para Android. A integração com iOS exigiria adicionar a plataforma, as descrições no `Info.plist` e compilar em um Mac.

## Problemas comuns

| Problema | Como resolver |
| --- | --- |
| “Plugin Camera is not implemented” no Android | Execute `npm run android:sync`, compile e reinstale o APK. |
| Android Studio não encontra o SDK | Abra SDK Manager e configure o diretório local do SDK. Não envie seu `android/local.properties` ao GitHub. |
| Erro de versão Java/Gradle | Use JDK 17 para este projeto. |
| Alterações aparecem no site, mas não no app | Rode `npm run android:sync` antes de compilar. |
| Acervo diferente no site e no APK | O armazenamento é local e separado para cada origem. |
| Imagem grande não salva | Escolha uma capa de até 20 MB e verifique o espaço livre. |
| Voltar/cancelar na galeria | Deve mostrar “Seleção cancelada” e permitir outra tentativa, preservando os campos. |
| A opção de câmera não funciona no site | Abra em HTTPS ou localhost e autorize a webcam. No Android, use o APK para testar a câmera nativa. |
| O workflow não aparece em Actions | Confira se `.github/workflows/android-apk.yml` existe na raiz do repositório; use `GERAR-APK.yml` como cópia de apoio. |

## Fontes técnicas

- Enunciado: https://dm12.pages.dev/#exercicios
- Camera, versão 6: https://capacitorjs.com/docs/v6/apis/camera
- Ambiente Capacitor 6: https://capacitorjs.com/docs/v6/getting-started/environment-setup

Mantida a versão principal 6 do Capacitor para acompanhar o material da aula. O projeto usa React 18 e Vite 6.
