@echo off
echo ==========================================
echo    Enviando Caça Palavras para o GitHub
echo ==========================================
echo.
echo Tentando enviar como usuario: rafaela512
echo.
echo ATENCAO: Uma janela de login do GitHub deve abrir.
echo 1. Se abrir no navegador: Clique em "Authorize" ou faca login.
echo 2. Se pedir senha no terminal: Voce precisa de um TOKEN (nao sua senha do site).
echo.
echo Se o login automatico falhar, vamos tentar limpar as credenciais antigas.
echo.
git push -u origin main
echo.
echo ==========================================
if %errorlevel% neq 0 (
    echo [ERRO] O envio falhou.
    echo Provavelmente ha um conflito de senha salva no Windows.
    echo.
    echo Tente remover as credenciais do GitHub no "Gerenciador de Credenciais" do Windows.
) else (
    echo [SUCESSO] Projeto enviado com sucesso!
)
echo ==========================================
pause
