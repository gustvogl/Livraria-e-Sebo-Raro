# Gerar o APK pelo GitHub

O projeto está preparado para o GitHub Actions compilar um APK Android de demonstração. Você não precisa instalar Android Studio para usar esse caminho.

## 1. Extraia o ZIP

Clique com o botão direito no ZIP e selecione **Extrair tudo**. Abra a pasta extraída.

**Envie os arquivos extraídos ao GitHub. Enviar somente o ZIP não gera o aplicativo.**

## 2. Coloque o conteúdo na raiz do repositório

Crie um repositório no GitHub e use **Add file → Upload files**. Envie as pastas e os arquivos do projeto, preservando seus nomes e caminhos. Depois clique em **Commit changes**.

No início do repositório devem aparecer:

- `package.json` e `package-lock.json`
- `.github/workflows/android-apk.yml`
- `android/`, incluindo `android/gradle/wrapper/gradle-wrapper.jar`
- `src/`, `public/`, `scripts/`, `tests/` e `licenses/`
- Os demais arquivos de configuração e documentação

Não coloque uma pasta extra envolvendo tudo. O `package.json` precisa aparecer assim que você abre a página inicial do repositório.

### Se a pasta .github não for enviada

1. No GitHub, clique em **Add file → Create new file**.
2. Em nome do arquivo, escreva exatamente: **`.github/workflows/android-apk.yml`**.
3. No computador, abra **`GERAR-APK.yml`** em um editor de texto e copie todo o conteúdo.
4. Cole no arquivo criado no GitHub e clique em **Commit changes**.

`GERAR-APK.yml` é uma cópia de apoio. O GitHub executa o arquivo que está dentro de `.github/workflows`.

## 3. Execute a compilação

1. Abra a aba **Actions** do repositório.
2. Se for exibida uma solicitação para habilitar os workflows deste repositório, habilite.
3. Escolha **Gerar APK da Livraria Rara**.
4. Clique em **Run workflow → Run workflow**. Uma execução também começa automaticamente quando você envia os arquivos.
5. Aguarde o resultado ficar verde. A primeira compilação pode levar vários minutos.

O fluxo configura **Node.js 22, Java 17, Android SDK 34 e Build Tools 34.0.0**. Ele instala as dependências, testa câmera e galeria, sincroniza o Capacitor, compila e verifica o APK.

## 4. Baixe e instale

1. Abra a execução verde.
2. No final da página, em **Artifacts**, clique em **Livraria-Rara-APK**.
3. Baixe e extraia esse ZIP.
4. Envie **`Livraria-Rara.apk`** ao celular e abra o arquivo para instalar.
5. Caso o Android solicite, autorize a instalação pelo aplicativo usado para abrir o arquivo.

Esse APK usa assinatura de depuração para testes e apresentação escolar. Não é um pacote de publicação na Play Store.

## 5. Teste a câmera e a atividade

1. Abra **Livraria Rara** no celular.
2. No cadastro, toque em **Tirar foto / Galeria**.
3. No seletor nativo do Android, escolha **Tirar foto** e conceda a permissão quando for solicitada.
4. Fotografe uma capa e confirme a foto. Ela deve aparecer imediatamente na prévia.
5. Abra a câmera outra vez e aperte **Voltar**. O aplicativo deve continuar funcionando e preservar a capa anterior.
6. Use **Escolher capa na galeria** para demonstrar também `CameraSource.Photos`, exigido no aluno 11.
7. Preencha título e autor e salve o livro.

## Se a compilação falhar

- Abra o passo vermelho e leia a mensagem de erro.
- Confira se todos os arquivos foram enviados, principalmente `android/`, `scripts/`, `package-lock.json` e `.github/workflows/android-apk.yml`.
- Se aparecer “package.json not found”, o conteúdo foi colocado dentro de uma pasta extra; mova os arquivos para a raiz.
- Se aparecer “GradleWrapperMain”, envie também `android/gradle/wrapper/gradle-wrapper.jar`.
- Se não aparecer nenhum workflow, confira o caminho `.github/workflows/android-apk.yml`.

O workflow não depende de banco de dados, Supabase, tokens ou secrets. Ele ainda precisa ser executado no seu repositório; este arquivo não afirma que uma compilação remota já ocorreu.
