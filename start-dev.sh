#!/bin/bash

# Script para iniciar todos los microfrontends en modo desarrollo
# Este script hace build de los MFEs y luego inicia preview para servir el remoteEntry.js

echo "Iniciando Streamia - Modo Desarrollo"
echo "========================================"

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Matar procesos previos
echo "Limpiando procesos previos..."

# Función para matar proceso en un puerto específico
kill_port() {
    local port=$1
    local pid=$(lsof -ti :$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        echo "  Matando proceso en puerto $port (PID: $pid)"
        kill -9 $pid 2>/dev/null || true
    fi
}

# Matar procesos en puertos específicos
kill_port 3000
kill_port 3001
kill_port 3006

# Matar cualquier proceso de vite restante
pkill -f "vite" 2>/dev/null || true

# Esperar a que los puertos se liberen
sleep 2

# Verificar que los puertos estén libres
for port in 3000 3001 3006; do
    if lsof -ti :$port > /dev/null 2>&1; then
        echo "Advertencia: Puerto $port todavía en uso"
        # Intentar matar de nuevo con más fuerza
        kill -9 $(lsof -ti :$port) 2>/dev/null || true
        sleep 1
    fi
done

# Limpiar builds anteriores
echo "Limpiando builds anteriores..."
rm -rf packages/auth-mfe/dist
rm -rf packages/static-mfe/dist
rm -rf packages/shell/dist

# Build Auth MFE
echo -e "\n${BLUE}Building Auth MFE...${NC}"
cd packages/auth-mfe
npm run build
if [ $? -ne 0 ]; then
    echo "Error building auth-mfe"
    exit 1
fi
cd ../..

# Build Static MFE
echo -e "\n${BLUE}Building Static MFE...${NC}"
cd packages/static-mfe
npm run build
if [ $? -ne 0 ]; then
    echo "Error building static-mfe"
    exit 1
fi
cd ../..

echo -e "\n${GREEN}Builds completados${NC}"
echo -e "\n${BLUE}Iniciando servidores...${NC}\n"

# Iniciar Auth MFE en preview mode
cd packages/auth-mfe
npm run preview > ../../logs/auth-mfe.log 2>&1 &
AUTH_PID=$!
cd ../..

# Iniciar Static MFE en preview mode
cd packages/static-mfe
npm run preview > ../../logs/static-mfe.log 2>&1 &
STATIC_PID=$!
cd ../..

# Esperar a que los MFEs estén listos
echo "Esperando a que los microfrontends estén listos..."
sleep 3

# Verificar que los servidores estén corriendo
if ! curl -s http://localhost:3001/assets/remoteEntry.js > /dev/null; then
    echo "Auth MFE no está disponible en puerto 3001"
    exit 1
fi

if ! curl -s http://localhost:3006/assets/remoteEntry.js > /dev/null; then
    echo "Static MFE no está disponible en puerto 3006"
    exit 1
fi

echo -e "${GREEN}Microfrontends listos${NC}"

# Iniciar Shell
echo -e "\n${BLUE}Iniciando Shell...${NC}"
cd packages/shell
npm run dev > ../../logs/shell.log 2>&1 &
SHELL_PID=$!
cd ../..

sleep 3

echo -e "\n${GREEN}======================================"
echo "Streamia iniciado correctamente"
echo "======================================${NC}"
echo ""
echo "Aplicación principal: http://localhost:3000"
echo "Auth MFE:             http://localhost:3001"
echo "Static MFE:           http://localhost:3006"
echo ""
echo "Ver logs:"
echo "   tail -f logs/shell.log"
echo "   tail -f logs/auth-mfe.log"
echo "   tail -f logs/static-mfe.log"
echo ""
echo "Para detener: pkill -f vite"
echo ""

# Mantener el script corriendo y mostrar logs del shell
tail -f logs/shell.log
