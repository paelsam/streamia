#!/bin/bash

# =============================================================================
# 🚀 STREAMIA - Script de Despliegue Automatizado a Vercel
# =============================================================================
# Este script despliega todos los microfrontends de Streamia en Vercel
# 
# Uso: ./deploy-to-vercel.sh [opciones]
#
# Opciones:
#   --all         Despliega todos los MFEs y el Shell
#   --mfes        Despliega solo los MFEs remotos (sin Shell)
#   --shell       Despliega solo el Shell
#   --help        Muestra esta ayuda
#
# Requisitos:
#   - Node.js instalado
#   - Vercel CLI instalado (npm i -g vercel)
#   - Estar autenticado en Vercel (vercel login)
# =============================================================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuración
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="/tmp/streamia-vercel-deploy"
BACKEND_URL="https://stremiaserver.onrender.com/api"

# Nombres de los proyectos en Vercelauth-mfe
declare -A MFE_PROJECTS=(
    ["auth-mfe"]="streamia-auth"
    ["catalog-mfe"]="streamia-catalog"
    ["favorites-mfe"]="streamia-favorites"
    ["static-mfe"]="streamia-static"
    ["comments-mfe"]="streamia-comments"
    ["profile-mfe"]="streamia-profile"
    ["player-mfe"]="streamia-player"
)
SHELL_PROJECT="streamia-shell"

# URLs desplegadas (se llenan durante el despliegue)
declare -A DEPLOYED_URLS

# =============================================================================
# Funciones de utilidad
# =============================================================================

print_banner() {
    echo -e "${PURPLE}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                                                               ║"
    echo "║   🎬 STREAMIA - Despliegue de Microfrontends a Vercel        ║"
    echo "║                                                               ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_step() {
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📦 $1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

show_help() {
    echo "Uso: $0 [opciones]"
    echo ""
    echo "Opciones:"
    echo "  --all         Despliega todos los MFEs y el Shell (por defecto)"
    echo "  --mfes        Despliega solo los MFEs remotos (sin Shell)"
    echo "  --shell       Despliega solo el Shell (requiere MFEs ya desplegados)"
    echo "  --help        Muestra esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0 --all      # Despliegue completo"
    echo "  $0 --mfes     # Solo actualizar MFEs"
    echo "  $0 --shell    # Solo actualizar Shell"
}

check_requirements() {
    print_step "Verificando requisitos..."
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js no está instalado"
        exit 1
    fi
    print_success "Node.js $(node --version)"
    
    # Verificar npm
    if ! command -v npm &> /dev/null; then
        print_error "npm no está instalado"
        exit 1
    fi
    print_success "npm $(npm --version)"
    
    # Verificar Vercel CLI
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI no está instalado. Instálalo con: npm i -g vercel"
        exit 1
    fi
    print_success "Vercel CLI $(vercel --version)"
    
    # Verificar autenticación en Vercel
    if ! vercel whoami &> /dev/null; then
        print_error "No estás autenticado en Vercel. Ejecuta: vercel login"
        exit 1
    fi
    print_success "Autenticado en Vercel como: $(vercel whoami)"
    
    # Verificar que estamos en el directorio correcto
    if [ ! -f "$SCRIPT_DIR/package.json" ] || [ ! -d "$SCRIPT_DIR/packages" ]; then
        print_error "Este script debe ejecutarse desde la raíz del proyecto Streamia"
        exit 1
    fi
    print_success "Directorio del proyecto verificado"
}

setup_deploy_dir() {
    print_info "Preparando directorio de despliegue..."
    rm -rf "$DEPLOY_DIR" 2>/dev/null || true
    mkdir -p "$DEPLOY_DIR"
}

create_vercel_json_mfe() {
    cat > "$DEPLOY_DIR/vercel.json" << 'EOF'
{
  "buildCommand": null,
  "installCommand": null,
  "framework": null,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET, OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type" }
      ]
    }
  ],
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
EOF
}

create_vercel_json_shell() {
    cat > "$DEPLOY_DIR/vercel.json" << 'EOF'
{
  "buildCommand": null,
  "installCommand": null,
  "framework": null,
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
EOF
}

install_dependencies() {
    print_step "Instalando dependencias..."
    cd "$SCRIPT_DIR"
    npm install
    print_success "Dependencias instaladas"
}

build_mfe() {
    local mfe_name=$1
    print_info "Construyendo $mfe_name..."
    
    cd "$SCRIPT_DIR"
    
    if npm run build --workspace="@streamia/$mfe_name" 2>/dev/null; then
        print_success "$mfe_name construido"
        return 0
    elif npm run build --workspace="$mfe_name" 2>/dev/null; then
        print_success "$mfe_name construido"
        return 0
    else
        print_error "Error construyendo $mfe_name"
        return 1
    fi
}

deploy_mfe() {
    local mfe_name=$1
    local project_name=$2
    
    print_info "Desplegando $mfe_name como $project_name..."
    
    # Limpiar directorio de despliegue
    rm -rf "$DEPLOY_DIR"/* "$DEPLOY_DIR"/.vercel 2>/dev/null || true
    
    # Copiar archivos de dist
    cp -r "$SCRIPT_DIR/packages/$mfe_name/dist/"* "$DEPLOY_DIR/"
    
    # Crear vercel.json con CORS
    create_vercel_json_mfe
    
    # Vincular y desplegar
    cd "$DEPLOY_DIR"
    vercel link --yes -p "$project_name" > /dev/null 2>&1
    
    local output=$(vercel deploy --prod --yes 2>&1)
    local url=$(echo "$output" | grep -oP 'https://[^\s]+\.vercel\.app' | head -1)
    
    if [ -n "$url" ]; then
        # Guardar URL base (sin el hash del deployment)
        DEPLOYED_URLS[$mfe_name]="https://${project_name}.vercel.app"
        print_success "Desplegado: https://${project_name}.vercel.app"
        return 0
    else
        print_error "Error desplegando $mfe_name"
        echo "$output"
        return 1
    fi
}

update_env_file() {
    print_step "Actualizando archivo .env con URLs de producción..."
    
    cat > "$SCRIPT_DIR/.env" << EOF
# =============================================================================
# Streamia - Production Environment Configuration
# Generado automáticamente por deploy-to-vercel.sh
# Fecha: $(date)
# =============================================================================

# Backend API URL
VITE_API_URL=${BACKEND_URL}

# Microfrontends URLs (Production)
VITE_AUTH_MFE_URL=https://streamia-auth.vercel.app/assets/remoteEntry.js
VITE_CATALOG_MFE_URL=https://streamia-catalog.vercel.app/assets/remoteEntry.js
VITE_FAVORITES_MFE_URL=https://streamia-favorites.vercel.app/assets/remoteEntry.js
VITE_STATIC_MFE_URL=https://streamia-static.vercel.app/assets/remoteEntry.js
VITE_COMMENTS_MFE_URL=https://streamia-comments.vercel.app/assets/remoteEntry.js
VITE_PLAYER_MFE_URL=https://streamia-player.vercel.app/assets/remoteEntry.js
EOF
    
    print_success "Archivo .env actualizado"
}

build_shell() {
    print_step "Construyendo Shell..."
    
    cd "$SCRIPT_DIR"
    
    if npm run build --workspace=shell 2>&1; then
        print_success "Shell construido"
        return 0
    else
        print_error "Error construyendo Shell"
        return 1
    fi
}

deploy_shell() {
    print_info "Desplegando Shell..."
    
    # Limpiar directorio de despliegue
    rm -rf "$DEPLOY_DIR"/* "$DEPLOY_DIR"/.vercel 2>/dev/null || true
    
    # Copiar archivos de dist
    cp -r "$SCRIPT_DIR/packages/shell/dist/"* "$DEPLOY_DIR/"
    
    # Crear vercel.json para SPA
    create_vercel_json_shell
    
    # Vincular y desplegar
    cd "$DEPLOY_DIR"
    vercel link --yes -p "$SHELL_PROJECT" > /dev/null 2>&1
    
    local output=$(vercel deploy --prod --yes 2>&1)
    
    if echo "$output" | grep -q "Production:"; then
        print_success "Shell desplegado: https://${SHELL_PROJECT}.vercel.app"
        return 0
    else
        print_error "Error desplegando Shell"
        echo "$output"
        return 1
    fi
}

verify_deployments() {
    print_step "Verificando despliegues..."
    
    local all_ok=true
    
    # Verificar MFEs
    for mfe_name in "${!MFE_PROJECTS[@]}"; do
        local project_name="${MFE_PROJECTS[$mfe_name]}"
        local url="https://${project_name}.vercel.app/assets/remoteEntry.js"
        
        if curl -sI "$url" | grep -q "HTTP/2 200"; then
            print_success "$project_name: OK"
        else
            print_error "$project_name: FALLO"
            all_ok=false
        fi
    done
    
    # Verificar Shell
    if curl -sI "https://${SHELL_PROJECT}.vercel.app" | grep -q "HTTP/2 200"; then
        print_success "$SHELL_PROJECT: OK"
    else
        print_error "$SHELL_PROJECT: FALLO"
        all_ok=false
    fi
    
    if [ "$all_ok" = true ]; then
        return 0
    else
        return 1
    fi
}

print_summary() {
    echo -e "\n${GREEN}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                                                               ║"
    echo "║   🎉 ¡DESPLIEGUE COMPLETADO EXITOSAMENTE!                     ║"
    echo "║                                                               ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo -e "${CYAN}📱 APLICACIÓN PRINCIPAL:${NC}"
    echo -e "   ${GREEN}https://streamia-shell.vercel.app${NC}"
    echo ""
    echo -e "${CYAN}🔧 MICROFRONTENDS:${NC}"
    echo "   Auth:      https://streamia-auth.vercel.app"
    echo "   Catalog:   https://streamia-catalog.vercel.app"
    echo "   Favorites: https://streamia-favorites.vercel.app"
    echo "   Static:    https://streamia-static.vercel.app"
    echo "   Comments:  https://streamia-comments.vercel.app"
    echo "   Player:    https://streamia-player.vercel.app"
    echo ""
    echo -e "${CYAN}🌐 BACKEND:${NC}"
    echo "   ${BACKEND_URL}"
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}👉 Abre tu aplicación: https://streamia-shell.vercel.app${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# =============================================================================
# Funciones de despliegue principal
# =============================================================================

deploy_all_mfes() {
    print_step "Desplegando todos los MFEs remotos..."
    
    for mfe_name in "${!MFE_PROJECTS[@]}"; do
        local project_name="${MFE_PROJECTS[$mfe_name]}"
        
        echo ""
        print_info "━━━ $mfe_name ━━━"
        
        if build_mfe "$mfe_name"; then
            if ! deploy_mfe "$mfe_name" "$project_name"; then
                print_error "Fallo en el despliegue de $mfe_name"
                return 1
            fi
        else
            return 1
        fi
    done
    
    print_success "Todos los MFEs desplegados correctamente"
}

deploy_only_shell() {
    print_step "Desplegando solo el Shell..."
    
    update_env_file
    
    if build_shell; then
        if deploy_shell; then
            print_success "Shell desplegado correctamente"
        else
            return 1
        fi
    else
        return 1
    fi
}

deploy_all() {
    # 1. Instalar dependencias
    install_dependencies
    
    # 2. Preparar directorio de despliegue
    setup_deploy_dir
    
    # 3. Desplegar MFEs remotos
    deploy_all_mfes
    
    # 4. Actualizar .env con URLs de producción
    update_env_file
    
    # 5. Construir y desplegar Shell
    print_step "Desplegando Shell..."
    if build_shell; then
        deploy_shell
    else
        return 1
    fi
    
    # 6. Verificar despliegues
    verify_deployments
    
    # 7. Mostrar resumen
    print_summary
}

# =============================================================================
# Main
# =============================================================================

main() {
    print_banner
    
    # Parsear argumentos
    local deploy_mode="all"
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --all)
                deploy_mode="all"
                shift
                ;;
            --mfes)
                deploy_mode="mfes"
                shift
                ;;
            --shell)
                deploy_mode="shell"
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                print_error "Opción desconocida: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Verificar requisitos
    check_requirements
    
    # Ejecutar despliegue según el modo
    case $deploy_mode in
        all)
            deploy_all
            ;;
        mfes)
            install_dependencies
            setup_deploy_dir
            deploy_all_mfes
            ;;
        shell)
            install_dependencies
            setup_deploy_dir
            deploy_only_shell
            ;;
    esac
    
    # Limpiar
    rm -rf "$DEPLOY_DIR" 2>/dev/null || true
    
    echo ""
    print_success "¡Proceso completado!"
}

# Ejecutar
main "$@"
