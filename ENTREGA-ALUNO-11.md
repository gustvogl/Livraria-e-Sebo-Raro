# Entrega — Aluno 11: Livraria e Sebo Raro

**Disciplina:** Programação para Dispositivos Móveis II  
**Aula:** 12 — Recursos de Hardware: Câmera Nativa  
**Professor:** Adriano Rosa Mazetto  
**Tema individual:** Livraria e Sebo Raro  
**Aluno:** preencha seu nome completo  
**Data de preparação:** 23/10/2026

## Entenda o que você fez

Você criou um aplicativo que cadastra livros antigos e permite tirar foto da capa ou escolher uma imagem da galeria. O aplicativo usa React para a interface e o estado; o Capacitor liga o JavaScript à câmera e ao seletor nativo do Android. A API retorna uma URI em `webPath`, que é colocada no `src` da imagem para mostrar a prévia imediatamente.

O requisito **do aluno 11** é `CameraSource.Photos` com `CameraResultType.Uri`, demonstrado pelo botão **Escolher capa na galeria**. O botão **Tirar foto / Galeria** também atende à demonstração geral: usa `CameraSource.Prompt` no APK e permite escolher a câmera nativa.

## Antes de gravar

- [ ] Gere o APK pelo GitHub seguindo `LEIA-PRIMEIRO-APK.md`, ou rode `npm ci` e `npm run android:open` com Android Studio.
- [ ] Instale e abra a versão Android em um celular físico.
- [ ] Deixe uma foto da capa de um livro na galeria.
- [ ] Confira se a foto não mostra dados pessoais desnecessários.
- [ ] Ative o gravador de tela do celular. Você também pode filmar a tela com outro aparelho.

## Sequência sugerida — aproximadamente 1 a 2 minutos

| Momento | O que mostrar | O que explicar |
| --- | --- | --- |
| 1 | Abra o app “Livraria Rara” no celular. | “Este é meu aplicativo do aluno 11, Livraria e Sebo Raro.” |
| 1A | Toque em **Tirar foto / Galeria**, mostre o seletor nativo e escolha **Tirar foto**. | “Também implementei CameraSource.Prompt para a escolha entre câmera e galeria.” |
| 1B | Autorize a câmera, tire uma foto e confirme; depois abra novamente e cancele. | “A foto aparece imediatamente e o cancelamento não trava o aplicativo.” |
| 2 | Toque em **Escolher capa na galeria**. | “Uso o plugin oficial Camera do Capacitor para abrir a galeria nativa.” |
| 3 | Mostre o seletor de fotos do Android e escolha uma capa. | “O exercício exige CameraSource.Photos e resultado Uri.” |
| 4 | Mostre a capa aparecendo na tela, antes de salvar. | “O webPath retornado é guardado no estado do React e exibido na tag img.” |
| 5 | Preencha título e autor. Opcionalmente, adicione ano e notas. | “Posso completar o cadastro sem perder a foto selecionada.” |
| 6 | Abra **Trocar capa na galeria**, depois aperte **Voltar** ou **Cancelar**. | “O cancelamento é tratado no catch. A foto e os campos anteriores são preservados, e o app continua funcionando.” |
| 7 | Abra a galeria novamente e selecione uma imagem. | “O finally libera o botão para uma nova tentativa.” |
| 8 | Toque em **Guardar no meu acervo** e abra o livro no catálogo. | “O livro e uma cópia da capa são guardados localmente.” |
| 9 | Se houver tempo, feche e reabra o app; mostre o livro salvo. | “O catálogo continua aqui porque os dados foram persistidos no aparelho.” |

No Android moderno, o Photo Picker pode abrir sem pedir acesso geral às fotos. Mostre o seletor que realmente aparece no aparelho; não simule um diálogo de permissão. A autorização do arquivo selecionado é gerenciada pelo sistema.

## Fala pronta para apresentar

“Meu aplicativo é a Livraria Rara, correspondente ao aluno 11. Ele permite cadastrar livros antigos, fotografar a capa e importar imagens da galeria. Usei React com o plugin oficial Camera do Capacitor, com qualidade 90 e CameraResultType.Uri. Para cumprir o aluno 11, o botão de galeria usa CameraSource.Photos. Também incluí CameraSource.Prompt para escolher a câmera nativa. A imagem é exibida imediatamente pelo webPath no estado do React. O cancelamento é tratado com try, catch e finally, sem apagar a capa anterior nem travar a aplicação. Como complemento, o acervo permite buscar, editar e excluir livros e guarda os dados no próprio aparelho.”

## Onde explicar cada parte do código

| Assunto | Arquivo / função |
| --- | --- |
| Importação e opções da API | `src/lib/camera.js` → `escolherCapaDaGaleria()` |
| Verificação e pedido de permissões | Mesmo arquivo, antes de `getPhoto()` |
| Cancelamento e recuperação | `src/LivrariaRaraApp.jsx` → `escolherGaleria()` |
| Estado da foto | `const [fotoCapa, setFotoCapa] = useState(null)` |
| Prévia no DOM | `<img src={fotoCapa.webPath} ... />` |
| Configuração Android | `android/app/src/main/AndroidManifest.xml` |
| Persistência do catálogo | `src/lib/acervo.js` |

## O que enviar

- [ ] Vídeo real do seu celular em `.mp4` / `.webm`, ou link do YouTube conforme permitido na atividade.
- [ ] Código-fonte / repositório, se o professor pedir.
- [ ] Confira se o vídeo mostra a prévia e, principalmente, o cancelamento seguido de nova tentativa.

O roteiro e o projeto estão prontos. A gravação no smartphone físico precisa ser feita por você; ela não está incluída no ZIP.
